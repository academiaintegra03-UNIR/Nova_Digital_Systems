import "server-only";
import { BRAND } from "@/lib/brand";
import { getResendClient } from "@/lib/email/resend";
import { emailHeaderHtml } from "@/lib/email/email-header";
import { escapeHtml } from "@/lib/html-escape";
import { siteName } from "@/lib/data/home-content";

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

function notificacionHtml(nombre: string): string {
  return wrapperHtml(`
    <p style="font-size:15px;color:${BRAND.oxford};margin:0 0 8px;font-weight:700;">
      ¡Buenas noticias, ${escapeHtml(nombre.split(" ")[0])}!
    </p>
    <p style="font-size:13px;color:${BRAND.glacierStrong};line-height:1.6;">
      Ya está disponible la prueba gratuita de ${siteName} y quedaste entre los primeros en recibir acceso.
      Muy pronto un asesor te contacta para activarla contigo.
    </p>
    <p style="font-size:11px;color:${BRAND.glacier};margin-top:24px;">
      Si tienes dudas mientras tanto, responde directo a este correo.
    </p>`);
}

/** Best-effort: nunca lanza — un correo que falla no debe bloquear el
 * registro de la postulación ni el cambio de estado en el panel admin. */
async function enviar(to: string, subject: string, html: string, logLabel: string): Promise<void> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resend || !from) {
    console.error(`Resend no configurado (RESEND_API_KEY / RESEND_FROM_EMAIL) — se omite el correo de ${logLabel}.`);
    return;
  }

  try {
    const { error } = await resend.emails.send({ from: `${siteName} <${from}>`, to, subject, html });
    if (error) console.error(`Failed to send ${logLabel} email:`, error);
  } catch (err) {
    console.error(`Failed to send ${logLabel} email:`, err);
  }
}

/** Se envía apenas alguien se postula desde el popup del sitio. */
export async function sendPostulacionConfirmacionEmail(to: string, nombre: string): Promise<void> {
  await enviar(to, "Recibimos tu postulación — prueba gratuita", confirmacionHtml(nombre), "confirmación de postulación");
}

/** Se envía cuando el admin marca la postulación como "notificado" en /admin/postulantes. */
export async function sendPostulacionNotificacionEmail(to: string, nombre: string): Promise<void> {
  await enviar(to, "Ya puedes acceder a tu prueba gratuita", notificacionHtml(nombre), "notificación de prueba gratuita");
}
