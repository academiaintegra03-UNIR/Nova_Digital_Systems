import "server-only";
import { getResendClient } from "@/lib/email/resend";
import { buildDiagnosticoPdf, diagnosticoReportFilename, type DiagnosticoReportData } from "@/lib/diagnostico/report-pdf";
import { siteName } from "@/lib/data/home-content";
import { escapeHtml } from "@/lib/html-escape";

function diagnosticoEmailHtml(data: DiagnosticoReportData): string {
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
    <div style="font-size:20px;font-weight:800;color:#1e3a5f;margin-bottom:2px;">${siteName}</div>
    <div style="font-size:12px;color:#9ca3af;margin-bottom:20px;">soberanocognitivo.com</div>

    <p style="font-size:15px;color:#111827;margin:0 0 6px;font-weight:700;">
      ${escapeHtml(data.estudianteNombre)} completó su diagnóstico académico
    </p>
    <p style="font-size:13px;color:#6b7280;margin:0 0 16px;">
      Adjuntamos el reporte en PDF con el puntaje, el desglose por materia y las recomendaciones.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-top:14px;background:#1e3a5f;border-radius:10px;">
      <tr>
        <td style="padding:14px 16px;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">
          Puntaje global
        </td>
        <td style="padding:14px 16px;color:#ffffff;font-size:18px;font-weight:800;text-align:right;">
          ${data.puntajeGlobal}%
        </td>
      </tr>
    </table>

    <p style="font-size:11px;color:#9ca3af;margin-top:24px;line-height:1.5;">
      Este reporte es un diagnóstico orientativo generado automáticamente por ${siteName} — no es un examen
      oficial ni certifica un puntaje ICFES. Si tienes dudas, escríbenos a soporte@soberanocognitivo.com.
    </p>
  </div>`;
}

/** Best-effort: nunca lanza. Un correo que falla no debe bloquear la
 * entrega del resultado en pantalla al estudiante. */
export async function sendDiagnosticoEmail(to: string, data: DiagnosticoReportData): Promise<void> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!resend || !from) {
    console.error("Resend no configurado (RESEND_API_KEY / RESEND_FROM_EMAIL) — se omite el correo de diagnóstico.");
    return;
  }

  try {
    const doc = await buildDiagnosticoPdf(data);
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    const { error } = await resend.emails.send({
      from: `${siteName} <${from}>`,
      to,
      subject: `Reporte de diagnóstico — ${data.estudianteNombre}`,
      html: diagnosticoEmailHtml(data),
      attachments: [{ filename: diagnosticoReportFilename(data), content: pdfBuffer }],
    });

    if (error) console.error("Failed to send diagnostico email:", error);
  } catch (err) {
    console.error("Failed to build/send diagnostico email:", err);
  }
}
