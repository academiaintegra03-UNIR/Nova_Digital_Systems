import { NextResponse, type NextRequest } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import { getBanco, esBancoId } from "@/lib/diagnostico/bancos";
import { calcularResultado } from "@/lib/diagnostico/scoring";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { sendDiagnosticoEmail } from "@/lib/email/send-diagnostico-email";
import { BANCO_LABEL, type Opcion } from "@/lib/diagnostico/types";
import type { Json } from "@/lib/supabase/database.types";

export const runtime = "nodejs";

const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

interface LeadInput {
  estudianteNombre: string;
  estudianteEdad?: string;
  estudianteEmail?: string;
  colegio?: string;
  grado?: string;
  acudienteEmail?: string;
  acudienteTelefono?: string;
}

interface SubmitBody {
  bancoId: string;
  lead: LeadInput;
  respuestas: Record<string, Opcion>;
  justificaciones?: Record<string, string>;
  desenfoquesCount: number;
}

function getClientKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isValidLead(lead: unknown, opts: { requireContacto: boolean }): lead is LeadInput {
  if (typeof lead !== "object" || lead === null) return false;
  const l = lead as Record<string, unknown>;
  if (typeof l.estudianteNombre !== "string" || l.estudianteNombre.trim().length === 0) return false;
  if (!opts.requireContacto) return true;
  const tieneContacto =
    (typeof l.acudienteEmail === "string" && l.acudienteEmail.trim().length > 0) ||
    (typeof l.acudienteTelefono === "string" && l.acudienteTelefono.trim().length > 0);
  return tieneContacto;
}

/** Correos de los acudientes vinculados a un estudiante logueado (tabla
 * `guardian_students`) — los `profiles` no guardan email, vive en
 * Supabase Auth, mismo patrón ya usado en admin/usuarios/page.tsx. */
async function getAcudienteEmails(admin: ReturnType<typeof createAdminClient>, studentId: string): Promise<string[]> {
  const { data: links } = await admin.from("guardian_students").select("guardian_id").eq("student_id", studentId);
  const emails: string[] = [];
  for (const link of links ?? []) {
    const { data } = await admin.auth.admin.getUserById(link.guardian_id);
    if (data.user?.email) emails.push(data.user.email);
  }
  return emails;
}

async function generarAnalisisIA(
  estudianteNombre: string,
  resultado: ReturnType<typeof calcularResultado>
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `Eres el Director Pedagógico de Nova Digital Systems. Un estudiante llamado ${estudianteNombre} acaba de terminar una batería diagnóstica. Resultados: ${JSON.stringify(
    {
      puntajeGlobal: resultado.puntajeGlobal,
      enfoqueScore: resultado.enfoqueScore,
      desgloseMaterias: resultado.desgloseMaterias,
    }
  )}. Redacta 3 recomendaciones tácticas y breves (máximo 30 palabras cada una), en español, tono cercano y constructivo, dirigidas al estudiante y su acudiente. No prometas resultados garantizados ni menciones un puntaje de examen oficial (ICFES u otro). Responde solo con las 3 recomendaciones, una por línea, sin numerarlas con markdown.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.6, thinkingConfig: { thinkingLevel: "low" } },
        }),
      }
    );
    if (!response.ok) {
      console.error("Gemini API error (diagnostico):", response.status, await response.text());
      return null;
    }
    const data = await response.json();
    const texto: string | undefined = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim();
    return texto || null;
  } catch (error) {
    console.error("Failed to reach Gemini API (diagnostico):", error);
    return null;
  }
}

function construirMensajeWhatsApp(
  lead: LeadInput,
  bancoId: string,
  resultado: ReturnType<typeof calcularResultado>
): string {
  const perfilTexto = resultado.perfilDominante ? `\n*Perfil dominante:* ${resultado.perfilDominante}` : "";
  return `🎯 *Diagnóstico académico — Nova Digital Systems*
👤 Estudiante: ${lead.estudianteNombre}
🏫 Colegio: ${lead.colegio || "No indicado"}
📊 Puntaje global: ${resultado.puntajeGlobal}% (${resultado.aciertos}/${resultado.totalPreguntas})
🎯 Índice de enfoque: ${resultado.enfoqueScore}%${perfilTexto}

Hola, acabo de completar el diagnóstico académico (banco: ${bancoId}). Quiero conocer la recomendación personalizada.`;
}

export async function POST(request: NextRequest) {
  if (isRateLimited(getClientKey(request), RATE_LIMIT, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ error: "Demasiados envíos seguidos. Espera unos minutos e intenta de nuevo." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  // Estudiante logueado: la cuenta es la fuente de verdad para identidad y
  // contacto, no lo que mande el cliente — y no hace falta pedir datos del
  // acudiente a mano, se resuelven solos vía guardian_students.
  const profile = await getAuthenticatedProfile();
  const esEstudianteLogueado = profile?.role === "estudiante";

  const { bancoId: bancoIdRaw, lead, respuestas, desenfoquesCount } = (body ?? {}) as Partial<SubmitBody>;

  if (!isValidLead(lead, { requireContacto: !esEstudianteLogueado }) || typeof respuestas !== "object" || respuestas === null) {
    return NextResponse.json({ error: "Completa tu nombre y un dato de contacto de tu acudiente." }, { status: 400 });
  }

  const bancoIdCandidato = String(bancoIdRaw ?? "");
  const bancoId = esBancoId(bancoIdCandidato) ? bancoIdCandidato : "general";
  const banco = getBanco(bancoId);

  const admin = createAdminClient();

  let estudianteNombre = lead.estudianteNombre;
  let estudianteEmail = lead.estudianteEmail ?? null;
  let colegio = lead.colegio ?? null;
  let profileId: string | null = null;
  let acudienteEmails: string[] = [];

  if (esEstudianteLogueado && profile) {
    profileId = profile.id;
    estudianteNombre = profile.nombre;

    const { data: fullProfile } = await admin.from("profiles").select("colegio_id").eq("id", profile.id).single();
    if (fullProfile?.colegio_id) {
      const { data: colegioProfile } = await admin.from("profiles").select("nombre").eq("id", fullProfile.colegio_id).single();
      if (colegioProfile) colegio = colegioProfile.nombre;
    }

    const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
    if (authUser.user?.email) estudianteEmail = authUser.user.email;

    acudienteEmails = await getAcudienteEmails(admin, profile.id);
  } else if (lead.acudienteEmail) {
    acudienteEmails = [lead.acudienteEmail];
  }

  const resultado = calcularResultado(banco, respuestas, Number(desenfoquesCount) || 0);
  const analisisIA = await generarAnalisisIA(estudianteNombre, resultado);
  const whatsappLink = getWhatsAppLink(
    construirMensajeWhatsApp({ ...lead, estudianteNombre, colegio: colegio ?? undefined }, bancoId, resultado)
  );

  try {
    await admin.from("diagnosticos").insert({
      banco_id: bancoId,
      grado: lead.grado ?? null,
      profile_id: profileId,
      estudiante_nombre: estudianteNombre,
      estudiante_edad: lead.estudianteEdad ? Number(lead.estudianteEdad) || null : null,
      estudiante_email: estudianteEmail,
      colegio,
      acudiente_email: acudienteEmails[0] ?? null,
      acudiente_telefono: lead.acudienteTelefono ?? null,
      aciertos: resultado.aciertos,
      total_preguntas: resultado.totalPreguntas,
      puntaje_global: resultado.puntajeGlobal,
      enfoque_score: resultado.enfoqueScore,
      desenfoques_count: resultado.desenfoquesCount,
      perfil_dominante: resultado.perfilDominante,
      desglose_materias: resultado.desgloseMaterias as unknown as Json,
      analisis_ia: analisisIA,
    });
  } catch (error) {
    // No bloquear la entrega del resultado al estudiante por un fallo de
    // guardado — el dato del lead se pierde para seguimiento interno, pero
    // la experiencia del usuario no se rompe.
    console.error("Failed to save diagnostico:", error);
  }

  // El reporte le llega tanto al estudiante como al acudiente — no solo
  // al acudiente. Deduplicado por si coinciden (ej. el mismo correo puesto
  // dos veces en el formulario público).
  const destinatarios = Array.from(new Set([estudianteEmail, ...acudienteEmails].filter((e): e is string => Boolean(e))));

  // Best-effort, sin await bloqueante del todo necesario pero se espera
  // aquí porque el runtime serverless puede cortar la ejecución apenas se
  // responda — sendDiagnosticoEmail nunca lanza, así que no añade riesgo.
  for (const email of destinatarios) {
    await sendDiagnosticoEmail(email, {
      estudianteNombre,
      estudianteEdad: lead.estudianteEdad,
      colegio: colegio ?? undefined,
      grado: lead.grado ?? null,
      bancoLabel: BANCO_LABEL[bancoId] ?? bancoId,
      createdAt: new Date().toISOString(),
      puntajeGlobal: resultado.puntajeGlobal,
      aciertos: resultado.aciertos,
      totalPreguntas: resultado.totalPreguntas,
      enfoqueScore: resultado.enfoqueScore,
      perfilDominante: resultado.perfilDominante,
      desgloseMaterias: resultado.desgloseMaterias,
      analisisIA,
    });
  }

  return NextResponse.json({ resultado, analisisIA, whatsappLink });
}
