/** Tope por pregunta al guardar: más que esto es un equipo que se quedó
 * abierto, no tiempo de trabajo real. */
export const MAX_SEGUNDOS_POR_PREGUNTA = 2 * 60 * 60;

/** Cronómetro en pantalla: "4:07", o "1:04:07" pasada la hora. */
export function formatCronometro(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

/** Duración legible para el informe: "45 s", "3 min 20 s", "1 h 05 min". */
export function formatDuracion(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  if (s < 60) return `${s} s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} h ${String(m).padStart(2, "0")} min`;
  const resto = s % 60;
  return resto ? `${m} min ${String(resto).padStart(2, "0")} s` : `${m} min`;
}
