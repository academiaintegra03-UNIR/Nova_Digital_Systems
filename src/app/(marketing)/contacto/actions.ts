"use server";

import { headers } from "next/headers";
import { isRateLimited } from "@/lib/rate-limit";
import { getResendClient } from "@/lib/email/resend";
import { escapeHtml } from "@/lib/html-escape";
import { emailHeaderHtml } from "@/lib/email/email-header";
import { siteName } from "@/lib/data/home-content";

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

const CONTACT_EMAIL_TO = process.env.CONTACT_EMAIL_TO?.trim() || "ingenieroeducativo@gmail.com";
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function notificacionHtml(data: { nombre: string; email: string; telefono: string; mensaje: string }): string {
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
    ${emailHeaderHtml()}
    <div style="font-size:18px;font-weight:800;color:#1e3a5f;margin-bottom:16px;">Nuevo mensaje de contacto</div>
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:10px;padding:0 16px;">
      <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Nombre</td><td style="padding:10px 16px;color:#111827;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(data.nombre)}</td></tr>
      <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Correo</td><td style="padding:10px 16px;color:#111827;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(data.email)}</td></tr>
      ${data.telefono ? `<tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">WhatsApp</td><td style="padding:10px 16px;color:#111827;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(data.telefono)}</td></tr>` : ""}
    </table>
    <div style="margin-top:16px;padding:14px 16px;background:#f3f6fa;border-radius:10px;font-size:13px;color:#111827;white-space:pre-line;">${escapeHtml(data.mensaje)}</div>
    <p style="font-size:11px;color:#9ca3af;margin-top:20px;">Responde directo a este correo — queda dirigido a ${escapeHtml(data.email)}.</p>
  </div>`;
}

function autoRespuestaHtml(nombre: string): string {
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
    ${emailHeaderHtml()}
    <p style="font-size:15px;color:#111827;margin:0 0 8px;font-weight:700;">¡Hola, ${escapeHtml(nombre.split(" ")[0])}!</p>
    <p style="font-size:13px;color:#6b7280;line-height:1.6;">
      Recibimos tu mensaje y te contactaremos en menos de 24 horas. Si necesitas una respuesta más rápida,
      escríbenos directo por WhatsApp.
    </p>
    <p style="font-size:11px;color:#9ca3af;margin-top:24px;">Este es un correo automático de confirmación — no hace falta que respondas aquí.</p>
  </div>`;
}

export async function sendContactMessageAction(formData: FormData): Promise<ContactFormState> {
  const nombre = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefono = String(formData.get("phone") ?? "").trim();
  const mensaje = String(formData.get("message") ?? "").trim();

  if (!nombre || !email || !mensaje) {
    return { error: "Completa tu nombre, correo y mensaje." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { error: "El correo no es válido." };
  }

  const clientKey = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`contacto:${clientKey}`, RATE_LIMIT, RATE_LIMIT_WINDOW_MS)) {
    return { error: "Enviaste varios mensajes seguidos. Espera unos minutos e intenta de nuevo." };
  }

  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resend || !from) {
    console.error("Resend no configurado (RESEND_API_KEY / RESEND_FROM_EMAIL) — no se pudo enviar el mensaje de contacto.");
    return { error: "No se pudo enviar tu mensaje en este momento. Escríbenos directo por WhatsApp mientras tanto." };
  }

  try {
    const { error } = await resend.emails.send({
      from: `${siteName} <${from}>`,
      to: CONTACT_EMAIL_TO,
      replyTo: email,
      subject: `Nuevo mensaje de contacto — ${nombre}`,
      html: notificacionHtml({ nombre, email, telefono, mensaje }),
    });
    if (error) {
      console.error("Failed to send contact notification email:", error);
      return { error: "No se pudo enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp." };
    }
  } catch (err) {
    console.error("Failed to send contact notification email:", err);
    return { error: "No se pudo enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp." };
  }

  // Auto-respuesta al visitante — best-effort: si falla, el mensaje ya
  // llegó al negocio, así que no se le muestra error al usuario por esto.
  try {
    const { error } = await resend.emails.send({
      from: `${siteName} <${from}>`,
      to: email,
      subject: "Recibimos tu mensaje — Nova Digital Systems",
      html: autoRespuestaHtml(nombre),
    });
    if (error) console.error("Failed to send contact auto-reply:", error);
  } catch (err) {
    console.error("Failed to send contact auto-reply:", err);
  }

  return { success: true };
}
