import "server-only";
import { absoluteUrl } from "@/lib/seo";
import { siteName } from "@/lib/data/home-content";

/**
 * Encabezado con el logo de la marca, para todos los correos
 * transaccionales (recibo, diagnóstico, contacto). Usa una tabla, no
 * flexbox — los clientes de correo (sobre todo Outlook de escritorio,
 * que renderiza con el motor de Word) no soportan flexbox de forma
 * confiable, pero sí tablas básicas. La imagen es una URL absoluta al
 * dominio real (`absoluteUrl`, src/lib/seo.ts) — los correos no pueden
 * cargar imágenes desde localhost ni desde el bundle del cliente.
 */
export function emailHeaderHtml(): string {
  const logoUrl = absoluteUrl("/Nova-PNG.png");
  return `
  <table role="presentation" style="border-collapse:collapse;margin-bottom:20px;">
    <tr>
      <td style="padding-right:10px;vertical-align:middle;">
        <img src="${logoUrl}" alt="${siteName}" width="36" height="36" style="display:block;border-radius:50%;" />
      </td>
      <td style="vertical-align:middle;">
        <div style="font-size:18px;font-weight:800;color:#1e3a5f;line-height:1.2;">${siteName}</div>
        <div style="font-size:11px;color:#9ca3af;">soberanocognitivo.com</div>
      </td>
    </tr>
  </table>`;
}
