import { BRAND } from "@/lib/brand";
import type { PaymentReceipt } from "@/app/checkout/gracias/actions";
import { siteName } from "@/lib/data/home-content";
import { documentTypeLabel } from "@/lib/data/document-types";

const COLOR_PRIMARY = BRAND.oxford;
const COLOR_MUTED = BRAND.glacierStrong;
const COLOR_FAINT = BRAND.glacier;
const COLOR_BORDER = BRAND.border;
const COLOR_TEXT = BRAND.oxford;
const COLOR_TOTAL_BG = BRAND.paper;

const PAGE_LEFT = 56;
const PAGE_RIGHT = 539;
const PAGE_WIDTH = PAGE_RIGHT - PAGE_LEFT;

export function formatCop(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(
    value
  );
}

export function formatReceiptDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function documentoCompleto(receipt: PaymentReceipt): string | null {
  if (!receipt.tipoDocumento || !receipt.numeroDocumento) return null;
  return `${documentTypeLabel(receipt.tipoDocumento)} ${receipt.numeroDocumento}`;
}

export function receiptFilename(receipt: PaymentReceipt) {
  return `recibo-nova-digital-systems-${receipt.reference}.pdf`;
}

/**
 * Builds the payment receipt PDF. Isomorphic — used both client-side (the
 * "Descargar recibo" button) and server-side (emailed after a Wompi
 * approval). Dynamic import keeps jsPDF out of the initial client bundle
 * without needing different code at either call site; in Node it just
 * resolves immediately.
 *
 * Deliberately labeled "Comprobante de pago", not "Factura electrónica" —
 * este documento no está autorizado por la DIAN (eso exige un proveedor de
 * facturación electrónica aparte), así que no debe presentarse como tal.
 */
export async function buildReceiptPdf(receipt: PaymentReceipt) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // ---- Encabezado ----
  let y = 64;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(COLOR_PRIMARY);
  doc.text(siteName, PAGE_LEFT, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_MUTED);
  doc.text("soberanocognitivo.com", PAGE_LEFT, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_FAINT);
  doc.text("N.° de recibo", PAGE_RIGHT, y - 14, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLOR_TEXT);
  doc.text(receipt.reference, PAGE_RIGHT, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_MUTED);
  doc.text(formatReceiptDate(receipt.createdAt), PAGE_RIGHT, y + 15, { align: "right" });

  y += 34;
  doc.setDrawColor(COLOR_BORDER);
  doc.setLineWidth(1.2);
  doc.line(PAGE_LEFT, y, PAGE_RIGHT, y);

  // ---- Título ----
  y += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(COLOR_TEXT);
  doc.text("Comprobante de pago", PAGE_LEFT, y);

  // ---- Cliente | Estado (dos columnas) ----
  y += 26;
  const colWidth = PAGE_WIDTH / 2 - 12;
  const col2X = PAGE_LEFT + PAGE_WIDTH / 2 + 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_FAINT);
  doc.text("FACTURADO A", PAGE_LEFT, y);
  doc.text("ESTADO DEL PAGO", col2X, y);

  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(COLOR_TEXT);
  doc.text(receipt.nombre, PAGE_LEFT, y);

  doc.setTextColor(receipt.status === "approved" ? "#15803d" : COLOR_TEXT);
  doc.text(receipt.status === "approved" ? "Pago confirmado" : receipt.status, col2X, y);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_MUTED);
  doc.text(receipt.email, PAGE_LEFT, y, { maxWidth: colWidth });
  doc.text("Método de pago", col2X, y);

  y += 14;
  doc.setTextColor(COLOR_TEXT);
  doc.text("Wompi (Web Checkout)", col2X, y);

  const documento = documentoCompleto(receipt);
  if (documento) {
    y += 14;
    doc.setTextColor(COLOR_MUTED);
    doc.text(documento, PAGE_LEFT, y);
  }

  // ---- Tabla de concepto ----
  y += 34;
  doc.setFillColor(COLOR_TOTAL_BG);
  doc.rect(PAGE_LEFT, y, PAGE_WIDTH, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_MUTED);
  doc.text("CONCEPTO", PAGE_LEFT + 10, y + 15);
  doc.text("PERÍODO", PAGE_LEFT + PAGE_WIDTH * 0.58, y + 15);
  doc.text("VALOR", PAGE_RIGHT - 10, y + 15, { align: "right" });

  y += 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLOR_TEXT);
  doc.text(receipt.planName, PAGE_LEFT + 10, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_MUTED);
  doc.text(receipt.planPeriod || "—", PAGE_LEFT + PAGE_WIDTH * 0.58, y);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLOR_TEXT);
  doc.text(formatCop(receipt.amountCop), PAGE_RIGHT - 10, y, { align: "right" });

  if (receipt.planDescription) {
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(COLOR_FAINT);
    const wrapped = doc.splitTextToSize(receipt.planDescription, PAGE_WIDTH * 0.55);
    doc.text(wrapped, PAGE_LEFT + 10, y);
    y += (wrapped.length - 1) * 12;
  }

  y += 20;
  doc.setDrawColor(COLOR_BORDER);
  doc.setLineWidth(0.75);
  doc.line(PAGE_LEFT, y, PAGE_RIGHT, y);

  // ---- Total ----
  y += 30;
  doc.setFillColor(COLOR_PRIMARY);
  doc.rect(PAGE_LEFT, y - 20, PAGE_WIDTH, 40, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor("#ffffff");
  doc.text("TOTAL PAGADO", PAGE_LEFT + 12, y + 5);
  doc.setFontSize(15);
  doc.text(formatCop(receipt.amountCop), PAGE_RIGHT - 12, y + 6, { align: "right" });

  // ---- Pie ----
  y += 60;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(COLOR_FAINT);
  const disclaimer = doc.splitTextToSize(
    `Este documento es un comprobante de pago generado automáticamente por ${siteName} y no constituye una factura electrónica autorizada por la DIAN. Ante cualquier duda sobre tu pago, escríbenos a soporte@soberanocognitivo.com.`,
    PAGE_WIDTH
  );
  doc.text(disclaimer, PAGE_LEFT, y);

  return doc;
}
