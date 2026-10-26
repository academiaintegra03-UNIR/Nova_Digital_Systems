import "server-only";
import { BRAND } from "@/lib/brand";
import { getResendClient } from "@/lib/email/resend";
import { emailHeaderHtml } from "@/lib/email/email-header";
import { escapeHtml } from "@/lib/html-escape";
import { siteName } from "@/lib/data/home-content";
import { absoluteUrl } from "@/lib/seo";
import { buildInformePdf, informeFilename, type InformePruebaData } from "@/lib/prueba-gratuita/informe-pdf";

function informeEmailHtml(data: InformePruebaData): string {
  const panelUrl = absoluteUrl("/campus/mi-informe");
  const filas = data.materias
    .map(
      (m) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.oxford};font-size:13px;">${escapeHtml(m.materia)}</td>
        <td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.oxford};font-size:13px;font-weight:700;text-align:right;">
          ${m.porcentaje}% <span style="color:${BRAND.glacierStrong};font-weight:400;">· ${escapeHtml(m.nivel)}</span>
        </td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
    ${emailHeaderHtml()}
    <p style="font-size:15px;color:${BRAND.oxford};margin:0 0 6px;font-weight:700;">
      ¡Terminaste tu prueba gratuita, ${escapeHtml(data.estudianteNombre.split(" ")[0])}!
    </p>
    <p style="font-size:13px;color:${BRAND.glacierStrong};margin:0 0 16px;line-height:1.6;">
      Adjuntamos tu informe en PDF con el resultado por materia, tus fortalezas, lo que debes reforzar y un plan de
      acción para cada pregunta que fallaste.
    </p>

    <table style="width:100%;border-collapse:collapse;background:${BRAND.oxford};border-radius:10px;">
      <tr>
        <td style="padding:14px 16px;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">
          Resultado general
        </td>
        <td style="padding:14px 16px;color:#ffffff;font-size:18px;font-weight:800;text-align:right;">
          ${data.porcentajeGlobal}% · ${escapeHtml(data.nivelGlobal)}
        </td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-top:12px;">${filas}</table>

    <table role="presentation" style="margin-top:20px;">
      <tr>
        <td style="background:${BRAND.arctic};border-radius:8px;">
          <a href="${panelUrl}" style="display:inline-block;padding:10px 20px;color:${BRAND.oxford};font-size:13px;font-weight:700;text-decoration:none;">
            Ver mi informe en el panel
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size:11px;color:${BRAND.glacier};margin-top:24px;line-height:1.5;">
      Este informe es orientativo y fue generado automáticamente por ${siteName}: no es un examen oficial ni certifica
      un puntaje ICFES. Si tienes dudas, responde a este correo.
    </p>
  </div>`;
}

/** Best-effort: nunca lanza — si el correo falla, el estudiante igual ve
 * y descarga su informe en la plataforma. */
export async function sendInformePruebaEmail(to: string, data: InformePruebaData): Promise<boolean> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resend || !from) {
    console.error("Resend no configurado (RESEND_API_KEY / RESEND_FROM_EMAIL) — se omite el correo del informe.");
    return false;
  }

  try {
    const doc = await buildInformePdf(data);
    const { error } = await resend.emails.send({
      from: `${siteName} <${from}>`,
      to,
      subject: `Tu informe de la prueba gratuita — ${data.porcentajeGlobal}%`,
      html: informeEmailHtml(data),
      attachments: [{ filename: informeFilename(data), content: Buffer.from(doc.output("arraybuffer")) }],
    });
    if (error) {
      console.error("Failed to send informe prueba email:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to build/send informe prueba email:", err);
    return false;
  }
}
