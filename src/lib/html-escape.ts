/** Escapa texto controlado por el usuario antes de interpolarlo en un
 * template de correo HTML — sin esto, un nombre como
 * `<a href="...">click</a>` se renderiza como link real en el correo del
 * destinatario (los remitentes transaccionales de este proyecto usan
 * strings de plantilla, no un motor de templates con auto-escape). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
