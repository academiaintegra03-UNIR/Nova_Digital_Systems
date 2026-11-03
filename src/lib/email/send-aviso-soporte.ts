import "server-only";
import { BRAND } from "@/lib/brand";
import { getResendClient } from "@/lib/email/resend";
import { emailHeaderHtml } from "@/lib/email/email-header";
import { escapeHtml } from "@/lib/html-escape";
import { siteName } from "@/lib/data/home-content";
import { CONTACT_EMAIL } from "@/lib/contact";
import { absoluteUrl } from "@/lib/seo";

interface AvisoSoporte {
  asunto: string;
  titulo: string;
  /** [etiqueta, valor] — las filas sin valor no se muestran. */
  filas: [string, string | null | undefined][];
  /** Correo de la persona, para que "Responder" le llegue a ella. */
  replyTo?: string | null;
  /** Ruta del panel admin donde está el registro completo. */
  adminPath?: string;
}

function avisoHtml({ titulo, filas, adminPath }: AvisoSoporte): string {
  const rows = filas
    .filter(([, valor]) => valor)
    .map(
      ([etiqueta, valor]) =>
        `<tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">${escapeHtml(etiqueta)}</td><td style="padding:10px 16px;color:#111827;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(String(valor))}</td></tr>`
    )
    .join("");
  const adminLink = adminPath
    ? `<p style="margin-top:16px;font-size:13px;"><a href="${absoluteUrl(adminPath)}" style="color:${BRAND.oxford};font-weight:700;">Ver en el panel admin</a></p>`
    : "";
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
    ${emailHeaderHtml()}
    <div style="font-size:18px;font-weight:800;color:${BRAND.oxford};margin-bottom:16px;">${escapeHtml(titulo)}</div>
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:10px;">${rows}</table>
    ${adminLink}
  </div>`;
}

/** Avisa al buzón de soporte (CONTACT_EMAIL) de un registro nuevo en el
 * sitio. Best-effort: nunca lanza — el registro ya quedó guardado. */
export async function sendAvisoSoporte(aviso: AvisoSoporte): Promise<void> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resend || !from) {
    console.error("Resend no configurado (RESEND_API_KEY / RESEND_FROM_EMAIL) — se omite el aviso a soporte.");
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: `${siteName} <${from}>`,
      to: CONTACT_EMAIL,
      replyTo: aviso.replyTo ?? undefined,
      subject: aviso.asunto,
      html: avisoHtml(aviso),
    });
    if (error) console.error("Failed to send aviso a soporte:", error);
  } catch (err) {
    console.error("Failed to send aviso a soporte:", err);
  }
}
