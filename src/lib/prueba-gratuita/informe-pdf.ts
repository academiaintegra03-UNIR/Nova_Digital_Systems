import { BRAND } from "@/lib/brand";
import { siteName } from "@/lib/data/home-content";

/** Datos ya calculados del informe — serializables, para armar el PDF
 * tanto en el navegador (botón "Descargar PDF") como en el servidor
 * (adjunto del correo). Se construyen en informe.ts. */
export interface InformePruebaData {
  estudianteNombre: string;
  fecha: string | null;
  porcentajeGlobal: number;
  nivelGlobal: string;
  correctas: number;
  total: number;
  materias: {
    materia: string;
    correctas: number;
    total: number;
    porcentaje: number;
    nivel: string;
    competencias: { competencia: string; correctas: number; total: number }[];
  }[];
  fortalezas: string[];
  aReforzar: string[];
  incidencias: { pestana: number; copiaPegado: number };
  preguntas: {
    materia: string;
    numero: number;
    tarea: string;
    correcta: boolean;
    elegida: string | null;
    clave: string;
    planDeAccion: string | null;
  }[];
}

const PAGE_LEFT = 56;
const PAGE_RIGHT = 539;
const PAGE_WIDTH = PAGE_RIGHT - PAGE_LEFT;
const PAGE_BOTTOM = 790;

export function informeFilename(data: InformePruebaData): string {
  const slug = data.estudianteNombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `informe-prueba-gratuita-${slug || "estudiante"}.pdf`;
}

/** Helvetica de jsPDF solo trae WinAnsi: símbolos como π, √ o subíndices
 * saldrían como basura en el PDF. */
function pdfTexto(texto: string): string {
  return texto
    .replace(/π/g, "pi")
    .replace(/√/g, "raíz de ")
    .replace(/Δ/g, "Delta ")
    .replace(/≈/g, "~")
    .replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080))
    .replace(/[^\x00-\xFF€–—‘’“”•…]/g, "");
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

export async function buildInformePdf(data: InformePruebaData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 64;

  function saltoSiHaceFalta(alto: number) {
    if (y + alto > PAGE_BOTTOM) {
      doc.addPage();
      y = 64;
    }
  }

  function titulo(texto: string) {
    saltoSiHaceFalta(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(BRAND.oxford);
    doc.text(texto, PAGE_LEFT, y);
    y += 16;
  }

  function parrafo(texto: string, opciones: { size?: number; color?: string; indent?: number; bold?: boolean } = {}) {
    const { size = 9.5, color = BRAND.glacierStrong, indent = 0, bold = false } = opciones;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lineas = doc.splitTextToSize(pdfTexto(texto), PAGE_WIDTH - indent);
    const alto = lineas.length * (size + 3);
    saltoSiHaceFalta(alto);
    doc.text(lineas, PAGE_LEFT + indent, y);
    y += alto;
  }

  function barra(porcentaje: number) {
    doc.setFillColor(BRAND.paper);
    doc.rect(PAGE_LEFT, y, PAGE_WIDTH, 6, "F");
    doc.setFillColor(BRAND.glacier);
    doc.rect(PAGE_LEFT, y, (PAGE_WIDTH * porcentaje) / 100, 6, "F");
    y += 18;
  }

  // ---- Encabezado ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(BRAND.oxford);
  doc.text(siteName, PAGE_LEFT, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(BRAND.glacierStrong);
  doc.text("soberanocognitivo.com", PAGE_LEFT, y + 15);
  if (data.fecha) {
    doc.setFontSize(9);
    doc.setTextColor(BRAND.glacier);
    doc.text("Fecha", PAGE_RIGHT, y - 14, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(BRAND.oxford);
    doc.text(formatFecha(data.fecha), PAGE_RIGHT, y, { align: "right" });
  }
  y += 34;
  doc.setDrawColor(BRAND.border);
  doc.setLineWidth(1.2);
  doc.line(PAGE_LEFT, y, PAGE_RIGHT, y);

  y += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(BRAND.oxford);
  doc.text("Informe de la prueba gratuita Saber 11", PAGE_LEFT, y);
  y += 18;
  parrafo(data.estudianteNombre, { size: 11, color: BRAND.oxford, bold: true });

  // ---- Puntaje destacado ----
  y += 10;
  doc.setFillColor(BRAND.oxford);
  doc.rect(PAGE_LEFT, y, PAGE_WIDTH, 50, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor("#ffffff");
  doc.text(`${data.porcentajeGlobal}%`, PAGE_LEFT + 14, y + 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${data.correctas} de ${data.total} respuestas correctas`, PAGE_LEFT + 100, y + 22);
  doc.text(`Nivel general: ${data.nivelGlobal}`, PAGE_LEFT + 100, y + 38);
  y += 76;

  // ---- Por materia ----
  titulo("Resultado por materia");
  for (const m of data.materias) {
    saltoSiHaceFalta(30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(BRAND.oxford);
    doc.text(m.materia, PAGE_LEFT, y);
    doc.setTextColor(BRAND.glacierStrong);
    doc.text(`${m.correctas}/${m.total} · ${m.porcentaje}% · ${m.nivel}`, PAGE_RIGHT, y, { align: "right" });
    y += 6;
    barra(m.porcentaje);
  }

  // ---- Fortalezas / a reforzar ----
  if (data.fortalezas.length) {
    y += 6;
    titulo("Tus fortalezas");
    for (const f of data.fortalezas) parrafo(`• ${f}`, { indent: 6 });
  }
  if (data.aReforzar.length) {
    y += 6;
    titulo("Qué reforzar");
    for (const f of data.aReforzar) parrafo(`• ${f}`, { indent: 6 });
  }

  // ---- Seguimiento ----
  y += 6;
  titulo("Seguimiento durante la prueba");
  parrafo(
    data.incidencias.pestana + data.incidencias.copiaPegado === 0
      ? "No se registraron salidas de la pestaña ni intentos de copiar o pegar."
      : `Salidas de la pestaña: ${data.incidencias.pestana} · Intentos de copiar, cortar o pegar: ${data.incidencias.copiaPegado}`
  );

  // ---- Detalle por materia ----
  for (const m of data.materias) {
    y += 10;
    titulo(`${m.materia}: detalle`);
    for (const c of m.competencias) parrafo(`${c.competencia}: ${c.correctas} de ${c.total}`, { size: 9 });
    y += 4;
    for (const p of data.preguntas.filter((q) => q.materia === m.materia)) {
      const estado = p.correcta ? "Correcta" : `Incorrecta (marcaste ${p.elegida ?? "—"}, la correcta era ${p.clave})`;
      parrafo(`Pregunta ${p.numero} — ${estado}`, { size: 9, color: p.correcta ? BRAND.oxford : BRAND.alert, bold: true });
      parrafo(p.tarea, { size: 8.5, indent: 10 });
      if (p.planDeAccion) parrafo(`Plan de acción: ${p.planDeAccion}`, { size: 8.5, indent: 10, color: BRAND.oxford });
      y += 4;
    }
  }

  // ---- Pie ----
  y += 16;
  parrafo(
    `Este informe es orientativo y fue generado automáticamente por ${siteName}: no es un examen oficial ni certifica un puntaje ICFES. Ante cualquier duda, escríbenos a soporte@soberanocognitivo.com.`,
    { size: 8, color: BRAND.glacier }
  );

  return doc;
}
