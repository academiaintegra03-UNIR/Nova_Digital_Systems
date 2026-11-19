import "server-only";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/** Respaldo por instancia para cuando la base de datos no responde. */
const hits = new Map<string, number[]>();

function isRateLimitedEnMemoria(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return false;
}

/**
 * Límite de intentos por ventana de tiempo, compartido entre instancias del
 * servidor (`consumir_rate_limit`, migración 0031). La clave se guarda como
 * hash porque suele contener una IP o un correo. Si la base falla se usa el
 * contador en memoria: un error de infraestructura no debe tumbar el formulario
 * ni dejarlo sin ningún límite.
 */
export async function isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const { data, error } = await createAdminClient().rpc("consumir_rate_limit", {
      p_clave: createHash("sha256").update(key).digest("hex"),
      p_limite: limit,
      p_ventana_ms: windowMs,
    });
    if (!error && typeof data === "boolean") return data;
    if (error) console.error("Rate limit compartido no disponible:", error.code);
  } catch (err) {
    console.error("Rate limit compartido no disponible:", err);
  }
  return isRateLimitedEnMemoria(key, limit, windowMs);
}
