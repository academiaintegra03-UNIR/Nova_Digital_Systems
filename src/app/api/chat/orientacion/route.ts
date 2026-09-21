import { NextResponse, type NextRequest } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { ORIENTATION_CHAT_MAX_MESSAGE_LENGTH, ORIENTATION_CHAT_MAX_USER_MESSAGES } from "@/lib/chat-config";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// gemini-2.5-* is no longer available to new API keys — Google moved new
// projects to the gemini-3 line. gemini-3-flash-preview "thinks" before
// answering by default, which silently ate the whole output budget and
// truncated replies mid-sentence (finishReason: MAX_TOKENS) until
// thinkingLevel was capped to "low" below.
const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const MAX_USER_MESSAGES = ORIENTATION_CHAT_MAX_USER_MESSAGES;
const MAX_MESSAGE_LENGTH = ORIENTATION_CHAT_MAX_MESSAGE_LENGTH;
const RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

const FALLBACK_MESSAGE =
  "No pude procesar tu mensaje en este momento. Intenta de nuevo en un momento, o escríbenos por el formulario de Contacto.";

const SYSTEM_PROMPT = `Eres Alex, el asistente virtual de orientación académica y admisiones de Nova Digital Studio Systems (academia de matemáticas). No eres profesor, ni psicólogo, ni evaluador oficial — no te presentes como tal.

OBJETIVO PRINCIPAL
Identificar la necesidad matemática de quien escribe, orientarlo brevemente y, cuando ya tengas suficiente contexto, invitarlo a continuar por WhatsApp para coordinar una sesión diagnóstica con el profesor (verá un botón para escribirle directo debajo del chat).

A QUIÉN ATIENDES
- Primaria (grados 3° a 5°, 8 a 11 años).
- Bachillerato (grados 6° a 11°, 11 a 18 años).
- Preparación para pruebas: Saber 11 / ICFES, admisión a Universidad Nacional, Universidad Distrital, Universidad de los Andes.
- Universidad: cálculo diferencial, cálculo integral, álgebra lineal.

TEMAS QUE SÍ CUBRES (según nivel)
- Primaria: operaciones básicas, números naturales, fracciones, decimales, porcentajes básicos, geometría básica, medición, patrones, razonamiento lógico.
- Bachillerato básico: enteros, racionales, razones y proporciones, potenciación, radicación, expresiones algebraicas, ecuaciones de primer grado, geometría plana, áreas y volúmenes, interpretación de gráficas.
- Bachillerato avanzado: productos notables, factorización, ecuaciones cuadráticas, sistemas de ecuaciones, inecuaciones, funciones, geometría analítica, trigonometría, sucesiones, probabilidad y estadística básica, límites, continuidad, introducción a derivadas.
- Saber 11 / admisión: interpretación, argumentación matemática, razonamiento cuantitativo, álgebra, geometría, estadística, probabilidad, manejo del tiempo, estrategias de examen, simulacros.
- Universidad: funciones, límites, derivadas y sus aplicaciones, integrales, vectores, matrices, determinantes, sistemas lineales, espacios vectoriales, transformaciones lineales.

FUERA DE ALCANCE — si preguntan por física, química, ecuaciones diferenciales, programación, contabilidad, o cualquier materia que no sea matemáticas, responde exactamente con este mensaje (puedes adaptar el saludo pero no el contenido):
"Ese tema no forma parte de las áreas atendidas actualmente. El profesor se especializa en matemáticas escolares, preparación para pruebas, cálculo y álgebra lineal. Puedo ayudarte a verificar si alguna de estas áreas responde a tu necesidad."

CÓMO CONVERSAS
- Una sola pregunta principal por mensaje, máximo 90 palabras por respuesta.
- No repitas información que el usuario ya te dio.
- Lenguaje sencillo con niños/acudientes; lenguaje un poco más técnico con universitarios.
- Sigue este flujo, sin forzarlo si el usuario ya adelantó información: 1) nivel/grado y tema a reforzar, 2) dificultad principal (¿no entiende el concepto, no resuelve ejercicios, no interpreta problemas, o se prepara para un examen?), 3) objetivo y urgencia, 4) evidencia mínima — pide 2-3 ejercicios de ejemplo o el último ejercicio que se le dificultó, en vez de asumir vacíos sin evidencia, 5) ciudad y modalidad preferida (virtual o presencial), 6) recomendación concreta de por dónde empezar, 7) cierre con un único llamado a la acción: invitar a continuar por WhatsApp (o por /contacto si lo prefiere) para coordinar la sesión diagnóstica con el profesor.
- No pidas el teléfono en el primer mensaje. Nunca pidas que lo escriban en el chat — el canal para compartir contacto es el botón de WhatsApp o el formulario de /contacto, no este chat.
- Si quien escribe es menor de edad, pide que la coordinación de la sesión continúe con su acudiente — no le pidas datos de contacto directos al menor.

LÍMITES ESTRICTOS, SIN EXCEPCIÓN
- No inventes precios, cifras, fechas, horarios ni cupos del profesor. Para precios exactos remite a /planes-precios; para ver todos los programas, a /programas.
- No afirmes que identificaste un vacío académico sin evidencia (ejercicios mostrados o descritos por el usuario).
- No prometas ni insinúes notas, puntajes, cupos, admisión universitaria o resultados garantizados.
- No resuelvas exámenes activos ni ayudes a hacer trampa académica.
- No proceses pagos ni guardes datos personales (documento, tarjetas). Para eso, remite siempre a WhatsApp o /contacto.
- Si algo está fuera de tu alcance o no lo sabes con certeza, dilo honestamente y remite a WhatsApp o /contacto.

Criterio de éxito: no es conseguir un teléfono a cualquier costo — es dar una orientación útil y dejar que la persona decida, por su cuenta, si quiere continuar por WhatsApp.`;

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

function getClientKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

interface ChatLogEvent {
  success: boolean;
  errorReason?: string;
  latencyMs?: number;
  userMessageLength?: number;
  promptTokens?: number;
  candidateTokens?: number;
}

/** Best-effort — a logging failure must never break the actual chat reply. */
async function logChatEvent(event: ChatLogEvent) {
  try {
    const admin = createAdminClient();
    await admin.from("chat_logs").insert({
      source: "orientacion",
      success: event.success,
      error_reason: event.errorReason ?? null,
      latency_ms: event.latencyMs ?? null,
      user_message_length: event.userMessageLength ?? null,
      prompt_tokens: event.promptTokens ?? null,
      candidate_tokens: event.candidateTokens ?? null,
    });
  } catch (err) {
    console.error("Failed to log chat event:", err);
  }
}

function isValidMessage(value: unknown): value is ChatMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    ((value as ChatMessage).role === "user" || (value as ChatMessage).role === "model") &&
    typeof (value as ChatMessage).text === "string" &&
    (value as ChatMessage).text.trim().length > 0 &&
    (value as ChatMessage).text.length <= MAX_MESSAGE_LENGTH
  );
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  if (isRateLimited(getClientKey(request), RATE_LIMIT, RATE_LIMIT_WINDOW_MS)) {
    await logChatEvent({ success: false, errorReason: "rate_limited", latencyMs: Date.now() - startedAt });
    return NextResponse.json(
      { error: "Demasiados mensajes seguidos. Espera unos minutos e intenta de nuevo." },
      { status: 429 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set.");
    await logChatEvent({ success: false, errorReason: "missing_api_key", latencyMs: Date.now() - startedAt });
    return NextResponse.json({ error: FALLBACK_MESSAGE }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    await logChatEvent({ success: false, errorReason: "invalid_json", latencyMs: Date.now() - startedAt });
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isValidMessage)) {
    await logChatEvent({ success: false, errorReason: "invalid_request", latencyMs: Date.now() - startedAt });
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1] as ChatMessage;

  const userMessageCount = (messages as ChatMessage[]).filter((m) => m.role === "user").length;
  if (userMessageCount > MAX_USER_MESSAGES) {
    await logChatEvent({
      success: false,
      errorReason: "limit_reached",
      latencyMs: Date.now() - startedAt,
      userMessageLength: lastMessage.text.length,
    });
    return NextResponse.json(
      { error: "Llegaste al límite de este chat. Continúa por WhatsApp o el formulario de Contacto." },
      { status: 400 }
    );
  }

  if (lastMessage.role !== "user") {
    await logChatEvent({ success: false, errorReason: "invalid_request", latencyMs: Date.now() - startedAt });
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: (messages as ChatMessage[]).map((m) => ({
            role: m.role,
            parts: [{ text: m.text }],
          })),
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.6,
            thinkingConfig: { thinkingLevel: "low" },
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", geminiResponse.status, await geminiResponse.text());
      await logChatEvent({
        success: false,
        errorReason: `gemini_error_${geminiResponse.status}`,
        latencyMs: Date.now() - startedAt,
        userMessageLength: lastMessage.text.length,
      });
      return NextResponse.json({ error: FALLBACK_MESSAGE }, { status: 502 });
    }

    const data = await geminiResponse.json();
    const reply: string | undefined = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim();

    if (!reply) {
      await logChatEvent({
        success: false,
        errorReason: "empty_reply",
        latencyMs: Date.now() - startedAt,
        userMessageLength: lastMessage.text.length,
      });
      return NextResponse.json({ error: FALLBACK_MESSAGE }, { status: 502 });
    }

    await logChatEvent({
      success: true,
      latencyMs: Date.now() - startedAt,
      userMessageLength: lastMessage.text.length,
      promptTokens: data?.usageMetadata?.promptTokenCount,
      candidateTokens: data?.usageMetadata?.candidatesTokenCount,
    });
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Failed to reach Gemini API:", error);
    await logChatEvent({
      success: false,
      errorReason: "network_error",
      latencyMs: Date.now() - startedAt,
      userMessageLength: lastMessage.text.length,
    });
    return NextResponse.json({ error: FALLBACK_MESSAGE }, { status: 502 });
  }
}
