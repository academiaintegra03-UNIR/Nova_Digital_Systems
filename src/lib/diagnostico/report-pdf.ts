import { siteName } from "@/lib/data/home-content";

const COLOR_PRIMARY = "#1e3a5f";
const COLOR_TEAL = "#2FA6A1";
const COLOR_MUTED = "#6b7280";
const COLOR_FAINT = "#9ca3af";
const COLOR_BORDER = "#e5e7eb";
const COLOR_TEXT = "#111827";
const COLOR_TRACK = "#f3f6fa";

const PAGE_LEFT = 56;
const PAGE_RIGHT = 539;
const PAGE_WIDTH = PAGE_RIGHT - PAGE_LEFT;

export interface DiagnosticoReportData {
  estudianteNombre: string;
  estudianteEdad?: string;
  colegio?: string;
  grado?: string | null;
  bancoLabel: string;
  createdAt: string;
  puntajeGlobal: number;
  aciertos: number;
  totalPreguntas: number;
  enfoqueScore: number;
  perfilDominante: string | null;
  desgloseMaterias: { materia: string; total: number; aciertos: number }[];
  analisisIA: string | null;
}

export function diagnosticoReportFilename(data: DiagnosticoReportData): string {
  const slug = data.estudianteNombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `diagnostico-${slug || "estudiante"}.pdf`;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/**
 * Reporte del diagnóstico académico — isomórfico (mismo patrón que
 * buildReceiptPdf en src/lib/receipt-pdf.ts): dynamic import de jsPDF
 * para usarlo tanto desde el botón "Descargar" del navegador como desde
 * el correo que se envía al acudiente.
 */
export async function buildDiagnosticoPdf(data: DiagnosticoReportData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

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
  doc.text("Fecha", PAGE_RIGHT, y - 14, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLOR_TEXT);
  doc.text(formatFecha(data.createdAt), PAGE_RIGHT, y, { align: "right" });

  y += 34;
  doc.setDrawColor(COLOR_BORDER);
  doc.setLineWidth(1.2);
  doc.line(PAGE_LEFT, y, PAGE_RIGHT, y);

  y += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(COLOR_TEXT);
  doc.text("Reporte de diagnóstico académico", PAGE_LEFT, y);

  y += 26;
  const colWidth = PAGE_WIDTH / 2 - 12;
  const col2X = PAGE_LEFT + PAGE_WIDTH / 2 + 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_FAINT);
  doc.text("ESTUDIANTE", PAGE_LEFT, y);
  doc.text("BATERÍA PRESENTADA", col2X, y);

  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(COLOR_TEXT);
  doc.text(data.estudianteNombre, PAGE_LEFT, y);
  doc.setFontSize(11);
  doc.text(data.bancoLabel, col2X, y, { maxWidth: colWidth });

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_MUTED);
  const infoLine = [data.estudianteEdad ? `${data.estudianteEdad} años` : null, data.colegio, data.grado]
    .filter(Boolean)
    .join(" · ");
  if (infoLine) doc.text(infoLine, PAGE_LEFT, y, { maxWidth: colWidth });

  // ---- Puntaje destacado ----
  y += 34;
  doc.setFillColor(COLOR_PRIMARY);
  doc.rect(PAGE_LEFT, y, PAGE_WIDTH, 50, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor("#ffffff");
  doc.text(`${data.puntajeGlobal}%`, PAGE_LEFT + 14, y + 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${data.aciertos} de ${data.totalPreguntas} respuestas correctas`, PAGE_LEFT + 100, y + 22);
  doc.text(`Índice de enfoque: ${data.enfoqueScore}%`, PAGE_LEFT + 100, y + 38);
  if (data.perfilDominante) {
    doc.setFont("helvetica", "bold");
    doc.text(`Perfil: ${data.perfilDominante}`, PAGE_RIGHT - 14, y + 30, { align: "right" });
  }

  // ---- Desglose por materia ----
  y += 80;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLOR_TEXT);
  doc.text("Desglose por materia", PAGE_LEFT, y);
  y += 16;

  for (const m of data.desgloseMaterias) {
    const pct = m.total > 0 ? Math.round((m.aciertos / m.total) * 100) : 0;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(COLOR_TEXT);
    doc.text(m.materia, PAGE_LEFT, y, { maxWidth: PAGE_WIDTH * 0.6 });
    doc.setTextColor(COLOR_MUTED);
    doc.text(`${pct}%`, PAGE_RIGHT, y, { align: "right" });
    y += 6;
    doc.setFillColor(COLOR_TRACK);
    doc.rect(PAGE_LEFT, y, PAGE_WIDTH, 6, "F");
    doc.setFillColor(COLOR_TEAL);
    doc.rect(PAGE_LEFT, y, (PAGE_WIDTH * pct) / 100, 6, "F");
    y += 18;
  }

  // ---- Recomendaciones ----
  if (data.analisisIA) {
    y += 10;
    doc.setDrawColor(COLOR_BORDER);
    doc.setLineWidth(0.75);
    doc.line(PAGE_LEFT, y, PAGE_RIGHT, y);
    y += 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLOR_TEXT);
    doc.text("Recomendaciones", PAGE_LEFT, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(COLOR_MUTED);
    const wrapped = doc.splitTextToSize(data.analisisIA, PAGE_WIDTH);
    doc.text(wrapped, PAGE_LEFT, y);
    y += wrapped.length * 12;
  }

  // ---- Pie ----
  y += 30;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(COLOR_FAINT);
  const disclaimer = doc.splitTextToSize(
    `Este reporte es un diagnóstico orientativo generado por ${siteName} — no es un examen oficial ni certifica un puntaje ICFES. Ante cualquier duda, escríbenos a soporte@soberanocognitivo.com.`,
    PAGE_WIDTH
  );
  doc.text(disclaimer, PAGE_LEFT, y);

  return doc;
}
