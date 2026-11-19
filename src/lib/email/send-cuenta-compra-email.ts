import "server-only";
import { BRAND } from "@/lib/brand";
import { getResendClient } from "@/lib/email/resend";
import { emailHeaderHtml } from "@/lib/email/email-header";
import { escapeHtml } from "@/lib/html-escape";
import { siteName } from "@/lib/data/home-content";
import { absoluteUrl } from "@/lib/seo";

function cuentaHtml(nombre: string, email: string, password: string): string {
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
    ${emailHeaderHtml()}
    <p style="font-size:15px;color:${BRAND.oxford};margin:0 0 8px;font-weight:700;">
      ¡Hola, ${escapeHtml(nombre.split(" ")[0])}!
    </p>
    <p style="font-size:13px;color:${BRAND.glacierStrong};margin:0 0 16px;line-height:1.6;">
      Confirmamos tu pago y tu cuenta de ${siteName} ya está activa. Estos son tus datos de acceso:
    </p>
    <table style="width:100%;border-collapse:collapse;background:${BRAND.oxford};border-radius:10px;">
      <tr><td style="padding:14px 16px 4px;color:${BRAND.onOxfordMuted};font-size:11px;font-weight:700;text-transform:uppercase;">Correo</td></tr>
      <tr><td style="padding:0 16px 10px;color:#ffffff;font-size:14px;font-weight:700;">${escapeHtml(email)}</td></tr>
      <tr><td style="padding:0 16px 4px;color:${BRAND.onOxfordMuted};font-size:11px;font-weight:700;text-transform:uppercase;">Contraseña</td></tr>
      <tr><td style="padding:0 16px 14px;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:.03em;">${escapeHtml(password)}</td></tr>
    </table>
    <table role="presentation" style="margin-top:20px;">
      <tr>
        <td style="background:${BRAND.arctic};border-radius:8px;">
          <a href="${absoluteUrl("/login")}" style="display:inline-block;padding:10px 20px;color:${BRAND.oxford};font-size:13px;font-weight:700;text-decoration:none;">
            Iniciar sesión
          </a>
        </td>
      </tr>
    </table>
    <p style="font-size:11px;color:${BRAND.glacier};margin-top:24px;line-height:1.5;">
      Guarda esta contraseña: no queda guardada en ningún otro lugar.
    </p>
  </div>`;
}

/** Única vez que la contraseña existe en texto plano. Nunca lanza: devuelve
 * si salió, para que el webhook avise a soporte cuando no fue así. */
export async function sendCuentaCompraEmail(to: string, nombre: string, password: string): Promise<boolean> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resend || !from) {
    console.error("Resend no configurado (RESEND_API_KEY / RESEND_FROM_EMAIL) — se omite el correo de acceso.");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: `${siteName} <${from}>`,
      to,
      subject: `Tu acceso a ${siteName}`,
      html: cuentaHtml(nombre, to, password),
    });
    if (error) console.error("Failed to send account email:", error.name);
    return !error;
  } catch (err) {
    console.error("Failed to send account email:", err);
    return false;
  }
}
