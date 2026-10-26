import "server-only";
import { BRAND } from "@/lib/brand";
import { getResendClient } from "@/lib/email/resend";
import { emailHeaderHtml } from "@/lib/email/email-header";
import { escapeHtml } from "@/lib/html-escape";
import { siteName } from "@/lib/data/home-content";
import { absoluteUrl } from "@/lib/seo";

function wrapperHtml(innerHtml: string): string {
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
    ${emailHeaderHtml()}
    ${innerHtml}
  </div>`;
}

function confirmacionHtml(nombre: string): string {
  return wrapperHtml(`
    <p style="font-size:15px;color:${BRAND.oxford};margin:0 0 8px;font-weight:700;">
      ¡Hola, ${escapeHtml(nombre.split(" ")[0])}!
    </p>
    <p style="font-size:13px;color:${BRAND.glacierStrong};line-height:1.6;">
      Recibimos tu postulación a la prueba gratuita de ${siteName}. Todavía no la lanzamos — en cuanto esté
      disponible, te escribimos a este mismo correo con los siguientes pasos.
    </p>
    <p style="font-size:11px;color:${BRAND.glacier};margin-top:24px;">
      Este es un correo automático de confirmación — no hace falta que respondas aquí.
    </p>`);
}

/** Incluye la contraseña real de la cuenta nueva — solo se genera y se ve
 * una vez, acá. Supabase la guarda ya hasheada (ver checkout/[planId]/actions.ts). */
function accesoHtml(nombre: string, email: string, password: string): string {
  // El link va a la página de la prueba, no directo a /login — sin sesión
  // esa página manda a /login y, tras iniciar sesión, de vuelta a la
  // prueba; ver src/app/prueba-gratuita/layout.tsx.
  const pruebaUrl = absoluteUrl("/prueba-gratuita");
  return wrapperHtml(`
    <p style="font-size:15px;color:${BRAND.oxford};margin:0 0 8px;font-weight:700;">
      ¡Buenas noticias, ${escapeHtml(nombre.split(" ")[0])}!
    </p>
    <p style="font-size:13px;color:${BRAND.glacierStrong};margin:0 0 16px;line-height:1.6;">
      Ya te creamos tu cuenta para la prueba gratuita de ${siteName}. Guarda estos datos de acceso:
    </p>

    <table style="width:100%;border-collapse:collapse;background:${BRAND.oxford};border-radius:10px;">
      <tr>
        <td style="padding:14px 16px 4px;color:${BRAND.onOxfordMuted};font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">
          Correo
        </td>
      </tr>
      <tr>
        <td style="padding:0 16px 10px;color:#ffffff;font-size:14px;font-weight:700;">${escapeHtml(email)}</td>
      </tr>
      <tr>
        <td style="padding:0 16px 4px;color:${BRAND.onOxfordMuted};font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">
          Contraseña
        </td>
      </tr>
      <tr>
        <td style="padding:0 16px 14px;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:.03em;">${escapeHtml(password)}</td>
      </tr>
    </table>

    <table role="presentation" style="margin-top:20px;">
      <tr>
        <td style="background:${BRAND.arctic};border-radius:8px;">
          <a href="${pruebaUrl}" style="display:inline-block;padding:10px 20px;color:${BRAND.oxford};font-size:13px;font-weight:700;text-decoration:none;">
            Ir a la prueba gratuita
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size:11px;color:${BRAND.glacier};margin-top:24px;line-height:1.5;">
      Guarda esta contraseña — no queda guardada en ningún otro lugar. Si tienes dudas, responde directo a este correo.
    </p>`);
}

/** Variante cuando el correo ya tenía una cuenta — no se crea una nueva
 * ni se toca su contraseña actual. */
function accesoCuentaExistenteHtml(nombre: string): string {
  const pruebaUrl = absoluteUrl("/prueba-gratuita");
  return wrapperHtml(`
    <p style="font-size:15px;color:${BRAND.oxford};margin:0 0 8px;font-weight:700;">
      ¡Buenas noticias, ${escapeHtml(nombre.split(" ")[0])}!
    </p>
    <p style="font-size:13px;color:${BRAND.glacierStrong};line-height:1.6;">
      Ya es tu turno para la prueba gratuita de ${siteName}. Vimos que ya tienes una cuenta con este correo —
      <a href="${pruebaUrl}" style="color:${BRAND.oxford};font-weight:700;">entra aquí</a> con tu contraseña de
      siempre para ver el acceso.
    </p>
    <p style="font-size:11px;color:${BRAND.glacier};margin-top:24px;">
      Si no recuerdas tu contraseña, escríbenos respondiendo este correo.
    </p>`);
}

/** Best-effort: nunca lanza — un correo que falla no debe bloquear el
 * registro de la postulación ni la creación de la cuenta en el panel
 * admin. Devuelve si se logró enviar, para que el llamador pueda avisarle
 * al admin cuando no fue así (ahí sí importa: es la única vez que se ve
 * la contraseña). */
async function enviar(to: string, subject: string, html: string, logLabel: string): Promise<boolean> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resend || !from) {
    console.error(`Resend no configurado (RESEND_API_KEY / RESEND_FROM_EMAIL) — se omite el correo de ${logLabel}.`);
    return false;
  }

  try {
    const { error } = await resend.emails.send({ from: `${siteName} <${from}>`, to, subject, html });
    if (error) {
      console.error(`Failed to send ${logLabel} email:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Failed to send ${logLabel} email:`, err);
    return false;
  }
}

/** Se envía apenas alguien se postula desde el popup del sitio. */
export async function sendPostulacionConfirmacionEmail(to: string, nombre: string): Promise<boolean> {
  return enviar(to, "Recibimos tu postulación — prueba gratuita", confirmacionHtml(nombre), "confirmación de postulación");
}

/** Se envía al notificar una postulación con cuenta nueva — incluye la
 * contraseña generada. Única vez que existe en texto plano. */
export async function sendPostulacionAccesoEmail(to: string, nombre: string, password: string): Promise<boolean> {
  return enviar(to, "Ya puedes acceder a tu prueba gratuita", accesoHtml(nombre, to, password), "acceso a prueba gratuita");
}

/** Se envía al notificar una postulación cuyo correo ya tenía cuenta. */
export async function sendPostulacionAccesoCuentaExistenteEmail(to: string, nombre: string): Promise<boolean> {
  return enviar(
    to,
    "Ya puedes acceder a tu prueba gratuita",
    accesoCuentaExistenteHtml(nombre),
    "acceso a prueba gratuita (cuenta existente)"
  );
}
