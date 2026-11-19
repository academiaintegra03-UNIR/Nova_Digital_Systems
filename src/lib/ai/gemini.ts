import "server-only";

const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const TIMEOUT_MS = 25_000;

export interface MensajeChat {
  role: "user" | "model";
  text: string;
}

/** Valida el historial que manda el navegador: forma, longitud, cantidad de
 * mensajes del usuario y que el último sea suyo. */
export function esHistorialValido(
  value: unknown,
  { maxMensajesUsuario, maxLongitud }: { maxMensajesUsuario: number; maxLongitud: number }
): value is MensajeChat[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const formaValida = value.every(
    (m: Partial<MensajeChat> | null) =>
      (m?.role === "user" || m?.role === "model") &&
      typeof m.text === "string" &&
      m.text.trim().length > 0 &&
      m.text.length <= maxLongitud
  );
  if (!formaValida) return false;
  const mensajes = value as MensajeChat[];
  return (
    mensajes[mensajes.length - 1].role === "user" &&
    mensajes.filter((m) => m.role === "user").length <= maxMensajesUsuario
  );
}

/** Respuesta del modelo, o null si no se pudo obtener. Nunca lanza. */
export async function generarRespuestaGemini({
  systemPrompt,
  mensajes,
  etiqueta,
}: {
  systemPrompt: string;
  mensajes: MensajeChat[];
  /** Identifica el origen en los registros de error. */
  etiqueta: string;
}): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set.");
    return null;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        contents: mensajes.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { maxOutputTokens: 500, temperature: 0.6, thinkingConfig: { thinkingLevel: "low" } },
      }),
    });

    if (!response.ok) {
      console.error(`Gemini API error (${etiqueta}):`, response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const reply: string | undefined = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim();
    return reply || null;
  } catch (error) {
    console.error(`Failed to reach Gemini API (${etiqueta}):`, error);
    return null;
  }
}
