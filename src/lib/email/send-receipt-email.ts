import "server-only";
import { getResendClient } from "@/lib/email/resend";
import { buildReceiptPdf, documentoCompleto, formatCop, formatReceiptDate, receiptFilename } from "@/lib/receipt-pdf";
import { siteName } from "@/lib/data/home-content";
import { escapeHtml } from "@/lib/html-escape";
import type { PaymentReceipt } from "@/app/checkout/gracias/actions";

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:9px 0;border-bottom:1px dashed #e5e7eb;color:#6b7280;font-size:13px;">${label}</td>
      <td style="padding:9px 0;border-bottom:1px dashed #e5e7eb;color:#111827;font-size:13px;font-weight:600;text-align:right;">${value}</td>
    </tr>`;
}

function sectionLabel(text: string): string {
  return `<div style="font-size:11px;font-weight:700;letter-spacing:.04em;color:#6b7280;text-transform:uppercase;margin:20px 0 6px;">${text}</div>`;
}

function receiptEmailHtml(receipt: PaymentReceipt): string {
  const documento = documentoCompleto(receipt);

  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
    <div style="font-size:20px;font-weight:800;color:#1e3a5f;margin-bottom:2px;">${siteName}</div>
    <div style="font-size:12px;color:#9ca3af;margin-bottom:20px;">soberanocognitivo.com</div>

    <p style="font-size:15px;color:#111827;margin:0 0 6px;font-weight:700;">¡Tu pago fue confirmado!</p>
    <p style="font-size:13px;color:#6b7280;margin:0 0 8px;">
      Tu cuenta ya está activa. Adjuntamos el comprobante en PDF para tus registros.
    </p>

    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:12px;padding:0 16px;">
      <tr><td colspan="2" style="padding-top:14px;">${sectionLabel("Facturado a")}</td></tr>
      ${row("Nombre", escapeHtml(receipt.nombre))}
      ${documento ? row("Documento", escapeHtml(documento)) : ""}
      ${row("Correo", escapeHtml(receipt.email))}
      <tr><td colspan="2">${sectionLabel("Detalles del pago")}</td></tr>
      ${row("Plan", escapeHtml(receipt.planName))}
      ${receipt.planPeriod ? row("Período", receipt.planPeriod) : ""}
      ${row("Fecha", formatReceiptDate(receipt.createdAt))}
      ${row("Referencia", receipt.reference)}
      ${row("Método de pago", "Wompi (Web Checkout)")}
    </table>

    <table style="width:100%;border-collapse:collapse;margin-top:14px;background:#1e3a5f;border-radius:10px;">
      <tr>
        <td style="padding:14px 16px;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">
          Total pagado
        </td>
        <td style="padding:14px 16px;color:#ffffff;font-size:18px;font-weight:800;text-align:right;">
          ${formatCop(receipt.amountCop)}
        </td>
      </tr>
    </table>

    <p style="font-size:11px;color:#9ca3af;margin-top:24px;line-height:1.5;">
      Este correo y su comprobante adjunto se generaron automáticamente por ${siteName} y no constituyen una
      factura electrónica autorizada por la DIAN. Si no reconoces este pago, o tienes dudas, escríbenos a
      soporte@soberanocognitivo.com.
    </p>
  </div>`;
}

/**
 * Best-effort: nunca lanza. Un correo que falla no debe tumbar la
 * activación de la suscripción ni la respuesta al webhook de Wompi —
 * solo se registra en logs para diagnóstico.
 */
export async function sendReceiptEmail(to: string, receipt: PaymentReceipt): Promise<void> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!resend || !from) {
    console.error("Resend no configurado (RESEND_API_KEY / RESEND_FROM_EMAIL) — se omite el correo de recibo.");
    return;
  }

  try {
    const doc = await buildReceiptPdf(receipt);
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    const { error } = await resend.emails.send({
      from: `${siteName} <${from}>`,
      to,
      subject: "Tu pago fue confirmado — comprobante adjunto",
      html: receiptEmailHtml(receipt),
      attachments: [{ filename: receiptFilename(receipt), content: pdfBuffer }],
    });

    if (error) console.error("Failed to send receipt email:", error);
  } catch (err) {
    console.error("Failed to build/send receipt email:", err);
  }
}
