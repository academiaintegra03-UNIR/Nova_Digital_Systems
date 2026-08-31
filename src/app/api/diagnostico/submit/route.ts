import { NextResponse, type NextRequest } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBanco, esBancoId } from "@/lib/diagnostico/bancos";
import { calcularResultado } from "@/lib/diagnostico/scoring";
import { getWhatsAppLink } from "@/lib/whatsapp";
import type { Opcion } from "@/lib/diagnostico/types";
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

function isValidLead(lead: unknown): lead is LeadInput {
  if (typeof lead !== "object" || lead === null) return false;
  const l = lead as Record<string, unknown>;
  if (typeof l.estudianteNombre !== "string" || l.estudianteNombre.trim().length === 0) return false;
  const tieneContacto =
    (typeof l.acudienteEmail === "string" && l.acudienteEmail.trim().length > 0) ||
    (typeof l.acudienteTelefono === "string" && l.acudienteTelefono.trim().length > 0);
  return tieneContacto;
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

  const { bancoId: bancoIdRaw, lead, respuestas, desenfoquesCount } = (body ?? {}) as Partial<SubmitBody>;

  if (!isValidLead(lead) || typeof respuestas !== "object" || respuestas === null) {
    return NextResponse.json({ error: "Completa tu nombre y un dato de contacto de tu acudiente." }, { status: 400 });
  }

  const bancoId = esBancoId(String(bancoIdRaw ?? "")) ? String(bancoIdRaw) : "general";
  const banco = getBanco(bancoId as Parameters<typeof getBanco>[0]);

  const resultado = calcularResultado(banco, respuestas, Number(desenfoquesCount) || 0);
  const analisisIA = await generarAnalisisIA(lead.estudianteNombre, resultado);
  const whatsappLink = getWhatsAppLink(construirMensajeWhatsApp(lead, bancoId, resultado));

  try {
    const admin = createAdminClient();
    await admin.from("diagnosticos").insert({
      banco_id: bancoId,
      grado: lead.grado ?? null,
      estudiante_nombre: lead.estudianteNombre,
      estudiante_edad: lead.estudianteEdad ? Number(lead.estudianteEdad) || null : null,
      estudiante_email: lead.estudianteEmail ?? null,
      colegio: lead.colegio ?? null,
      acudiente_email: lead.acudienteEmail ?? null,
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

  return NextResponse.json({ resultado, analisisIA, whatsappLink });
}
