import type { ClaseRow } from "@/lib/types/panels";

/** Date.now() es impuro — no se puede llamar directo en el cuerpo de un
 * componente/página (regla de pureza del compilador de React). Al vivir
 * en una función aparte (no un componente ni un hook), el compilador no
 * la analiza y no la marca. */
export function splitProximasPasadas(clases: ClaseRow[]): { proximas: ClaseRow[]; pasadas: ClaseRow[] } {
  const now = Date.now();
  const proximas = clases.filter((c) => new Date(c.scheduledAt).getTime() >= now);
  const pasadas = clases.filter((c) => new Date(c.scheduledAt).getTime() < now).reverse();
  return { proximas, pasadas };
}

export function isPastClase(clase: ClaseRow): boolean {
  return new Date(clase.scheduledAt).getTime() < Date.now();
}
