import "server-only";
import { BRAND } from "@/lib/brand";
import { getResendClient } from "@/lib/email/resend";
import { emailHeaderHtml } from "@/lib/email/email-header";
import { escapeHtml } from "@/lib/html-escape";
import { siteName } from "@/lib/data/home-content";
import { absoluteUrl } from "@/lib/seo";

/** Las clases se programan en hora de Colombia; `profiles` no guarda zona horaria. */
const ZONA_HORARIA = "America/Bogota";

export interface RecordatorioClase {
  id: string;
  tipo: "24h" | "1h";
  claseNombre: string;
  materiaNombre: string;
  scheduledAt: string;
  durationMinutes: number | null;
  meetingLink: string | null;
  destinatarioNombre: string;
  destinatarioEmail: string;
}

export type ResultadoEnvio = { ok: true; proveedorId: string | null } | { ok: false; codigo: string };

function formatFechaClase(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: ZONA_HORARIA,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** `meeting_link` es texto libre: solo se enlaza si es http(s). */
function enlaceSeguro(url: string | null): string | null {
  if (!url) return null;
  try {
    const { protocol, href } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? href : null;
  } catch {
    return null;
  }
}

function contenido(r: RecordatorioClase) {
  const fecha = `${formatFechaClase(r.scheduledAt)} (hora de Colombia)`;
  const titulo = r.tipo === "1h" ? "Tu clase empieza en menos de una hora" : "Tienes una clase programada";
  const nombreAsunto = r.claseNombre.replace(/[\r\n]+/g, " ");
  const asunto = r.tipo === "1h" ? `Tu clase empieza pronto: ${nombreAsunto}` : `Recordatorio de clase: ${nombreAsunto}`;
  const enlace = enlaceSeguro(r.meetingLink);
  const misClases = absoluteUrl("/campus/mis-clases");
  const filas: [string, string][] = [
    ["Clase", r.claseNombre],
    ["Materia", r.materiaNombre],
    ["Fecha", fecha],
    ...(r.durationMinutes ? ([["Duración", `${r.durationMinutes} minutos`]] as [string, string][]) : []),
  ];

  const filasHtml = filas
    .map(
      ([etiqueta, valor]) =>
        `<tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">${escapeHtml(etiqueta)}</td><td style="padding:10px 16px;color:#111827;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(valor)}</td></tr>`
    )
    .join("");
  const destino = enlace ?? misClases;
  const textoBoton = enlace ? "Entrar a la clase" : "Ver mis clases";

  const html = `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
    ${emailHeaderHtml()}
    <div style="font-size:18px;font-weight:800;color:${BRAND.oxford};margin-bottom:8px;">${escapeHtml(titulo)}</div>
    <p style="font-size:14px;color:#374151;margin:0 0 16px;">Hola, ${escapeHtml(r.destinatarioNombre)}. Estos son los datos de tu clase:</p>
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:10px;">${filasHtml}</table>
    <p style="margin:24px 0 0;"><a href="${escapeHtml(destino)}" style="display:inline-block;background:${BRAND.oxford};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 20px;border-radius:8px;">${textoBoton}</a></p>
  </div>`;

  const texto = [
    titulo,
    "",
    `Hola, ${r.destinatarioNombre}. Estos son los datos de tu clase:`,
    ...filas.map(([etiqueta, valor]) => `${etiqueta}: ${valor}`),
    "",
    `${textoBoton}: ${destino}`,
  ].join("\n");

  return { asunto, html, texto };
}

/** Nunca lanza: devuelve el código de error para que quien llama decida si
 * reintenta. La llave de idempotencia evita un correo doble si un reintento
 * llega después de un envío que sí salió. */
export async function sendRecordatorioClase(r: RecordatorioClase): Promise<ResultadoEnvio> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resend || !from) return { ok: false, codigo: "missing_api_key" };

  const { asunto, html, texto } = contenido(r);
  try {
    const { data, error } = await resend.emails.send(
      { from: `${siteName} <${from}>`, to: r.destinatarioEmail, subject: asunto, html, text: texto },
      { idempotencyKey: `recordatorio-clase/${r.id}` }
    );
    if (error) return { ok: false, codigo: error.name };
    return { ok: true, proveedorId: data?.id ?? null };
  } catch {
    return { ok: false, codigo: "application_error" };
  }
}
