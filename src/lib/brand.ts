/**
 * Paleta "Glacier & Oxford" del Manual de Arquitectura de Marca NDSS para los
 * lugares donde NO se pueden usar variables CSS: imagen Open Graph, PDFs y
 * correos HTML. Es el espejo de las primitivas de `src/app/globals.css` —
 * si cambia un color de marca, se actualiza en ambos archivos.
 */
export const BRAND = {
  oxford: "#002147", // fondo / autoridad
  glacier: "#718c9a", // interfaz secundaria
  glacierStrong: "#3e5c75", // glacier hacia oxford: texto pequeño con contraste AA
  arctic: "#a1e3f7", // solo llamadas a la acción
  paper: "#f4f5f8", // fondo general
  alert: "#ef3a25", // errores y alertas (< 2% del diseño)
  border: "#c6d1d8",
  onOxfordMuted: "#cdd7dc", // texto secundario sobre oxford
} as const;
