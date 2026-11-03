/** Mismo tope que el check de postulaciones_prueba_gratuita.colegio (0027). */
export const COLEGIO_MAX_LENGTH = 200;

/**
 * Colegio escrito o elegido en InstitucionCombobox, listo para guardar:
 * sin espacios de sobra y recortado al tope. Devuelve null si viene vacío
 * o no es texto, para que la columna quede en NULL y no en "".
 */
export function normalizarColegio(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.replace(/\s+/g, " ").trim().slice(0, COLEGIO_MAX_LENGTH);
  return limpio || null;
}
