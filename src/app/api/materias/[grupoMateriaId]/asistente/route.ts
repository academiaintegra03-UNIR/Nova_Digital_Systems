import { NextResponse, type NextRequest } from "next/server";
import { esHistorialValido, generarRespuestaGemini } from "@/lib/ai/gemini";
import { isRateLimited } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import { getGrupoMateriaContextForStudent, getGrupoMateriaContextForTutor } from "@/lib/queries/grupo-materias";
import { getRecursosParaGrupoMateria } from "@/lib/queries/recursos";

export const runtime = "nodejs";

const MAX_USER_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

const FALLBACK_MESSAGE =
  "No pude procesar tu mensaje en este momento. Intenta de nuevo en un momento, o pregúntale directamente a tu tutor en el foro de la materia.";

function systemPromptFor(materiaNombre: string, recursoTitulos: string[]): string {
  const recursosTexto =
    recursoTitulos.length > 0
      ? `\n\nRECURSOS QUE EL TUTOR CARGÓ PARA ESTA MATERIA (puedes mencionarlos si son relevantes, no inventes otros): ${recursoTitulos.join(", ")}.`
      : "";

  return `Eres el asistente de estudio de la materia "${materiaNombre}" en Nova Digital Studio Systems. Ayudas a estudiantes de esa materia a entender conceptos, resolver dudas y prepararse — no eres el tutor humano, no reemplazas sus clases ni calificaciones.

CÓMO RESPONDES
- Explica con ejemplos claros, adaptados al nivel de bachillerato.
- Máximo 150 palabras por respuesta, en español.
- Si la pregunta no tiene que ver con "${materiaNombre}", dilo honestamente y sugiere preguntarle a su tutor o usar el foro de la materia.${recursosTexto}

LÍMITES ESTRICTOS
- No resuelvas evaluaciones o exámenes activos completos — guía el razonamiento, no des solo la respuesta final sin explicación.
- No inventes fechas de clases, actividades o calificaciones — para eso remite a las pestañas Clases/Actividades de la materia.
- Si no sabes algo con certeza, dilo honestamente.`;
}

async function resolverContextoMateria(
  grupoMateriaId: string
): Promise<{ materiaNombre: string; recursoTitulos: string[] } | { error: NextResponse }> {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    return { error: NextResponse.json({ error: "No autenticado." }, { status: 401 }) };
  }

  if (profile.role === "tutor") {
    const admin = createAdminClient();
    const contexto = await getGrupoMateriaContextForTutor(admin, grupoMateriaId, profile.id);
    if (!contexto) return { error: NextResponse.json({ error: "Esa materia no es tuya." }, { status: 403 }) };
    const recursos = await getRecursosParaGrupoMateria(admin, contexto.grupoId, contexto.materiaId);
    return { materiaNombre: contexto.materiaNombre, recursoTitulos: recursos.map((r) => r.titulo) };
  }

  if (profile.role === "estudiante") {
    const supabase = await createClient();
    const contexto = await getGrupoMateriaContextForStudent(supabase, grupoMateriaId);
    if (!contexto) return { error: NextResponse.json({ error: "Esa materia no es tuya." }, { status: 403 }) };
    const recursos = await getRecursosParaGrupoMateria(supabase, contexto.grupoId, contexto.materiaId);
    return { materiaNombre: contexto.materiaNombre, recursoTitulos: recursos.map((r) => r.titulo) };
  }

  return { error: NextResponse.json({ error: "No autorizado." }, { status: 403 }) };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ grupoMateriaId: string }> }) {
  const { grupoMateriaId } = await params;

  const profile = await getAuthenticatedProfile();
  if (!profile) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  if (await isRateLimited(`asistente:${profile.id}`, RATE_LIMIT, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ error: "Demasiados mensajes seguidos. Espera unos minutos e intenta de nuevo." }, { status: 429 });
  }

  const contexto = await resolverContextoMateria(grupoMateriaId);
  if ("error" in contexto) return contexto.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!esHistorialValido(messages, { maxMensajesUsuario: MAX_USER_MESSAGES, maxLongitud: MAX_MESSAGE_LENGTH })) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const reply = await generarRespuestaGemini({
    systemPrompt: systemPromptFor(contexto.materiaNombre, contexto.recursoTitulos),
    mensajes: messages,
    etiqueta: "asistente materia",
  });
  if (!reply) return NextResponse.json({ error: FALLBACK_MESSAGE }, { status: 502 });

  return NextResponse.json({ reply });
}
