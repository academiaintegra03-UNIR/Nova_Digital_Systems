import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient } from "@/lib/email/resend";
import { sendRecordatorioClase, type RecordatorioClase } from "@/lib/email/send-recordatorio-clase";

/** Con la pausa de abajo, un lote cabe en el presupuesto de tiempo. Lo que
 * no alcance a salir se toma en la siguiente ejecución. */
const TAMANO_LOTE = 50;
/** Resend limita las peticiones por segundo; se envía de a una con pausa. */
const PAUSA_ENTRE_ENVIOS_MS = 600;
/** Debe quedar por debajo de `maxDuration` de la ruta. */
const PRESUPUESTO_MS = 45_000;
/** Coincide con c_max_intentos en 0028_clase_recordatorios.sql. */
const MAX_INTENTOS = 3;

/** Errores que afectarían a todos los correos siguientes: no tiene sentido
 * seguir ni gastar los intentos del resto del lote. */
const ERRORES_QUE_DETIENEN = new Set([
  "daily_quota_exceeded",
  "monthly_quota_exceeded",
  "rate_limit_exceeded",
  "missing_api_key",
  "invalid_api_key",
  "restricted_api_key",
  "invalid_from_address",
]);

export interface ResumenRecordatorios {
  reclamados: number;
  enviados: number;
  fallidos: number;
  reintentos: number;
  liberados: number;
  detenidoPor: string | null;
}

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Una pasada del envío de recordatorios: reclama un lote en la base y manda
 * los correos. Se puede ejecutar a cualquier ritmo y en paralelo, porque
 * `reclamar_recordatorios_clases` reparte las filas sin repetirlas.
 */
export async function procesarRecordatoriosClases(): Promise<ResumenRecordatorios> {
  if (!getResendClient() || !process.env.RESEND_FROM_EMAIL?.trim()) {
    throw new Error("Resend no configurado (RESEND_API_KEY / RESEND_FROM_EMAIL).");
  }

  const admin = createAdminClient();
  const { data: lote, error } = await admin.rpc("reclamar_recordatorios_clases", { p_limite: TAMANO_LOTE });
  if (error) throw new Error(`No se pudo reclamar el lote de recordatorios: ${error.message}`);

  const resumen: ResumenRecordatorios = {
    reclamados: lote.length,
    enviados: 0,
    fallidos: 0,
    reintentos: 0,
    liberados: 0,
    detenidoPor: null,
  };
  const inicio = Date.now();
  let procesados = 0;

  for (const fila of lote) {
    if (Date.now() - inicio > PRESUPUESTO_MS) {
      resumen.detenidoPor = "presupuesto_de_tiempo";
      break;
    }

    const recordatorio: RecordatorioClase = {
      id: fila.recordatorio_id,
      tipo: fila.tipo as RecordatorioClase["tipo"],
      claseNombre: fila.clase_nombre,
      materiaNombre: fila.materia_nombre,
      scheduledAt: fila.scheduled_at,
      durationMinutes: fila.duration_minutes,
      meetingLink: fila.meeting_link,
      destinatarioNombre: fila.destinatario_nombre,
      destinatarioEmail: fila.destinatario_email,
    };
    const resultado = await sendRecordatorioClase(recordatorio);

    if (!resultado.ok && ERRORES_QUE_DETIENEN.has(resultado.codigo)) {
      resumen.detenidoPor = resultado.codigo;
      break;
    }
    procesados += 1;

    const cambios = resultado.ok
      ? {
          estado: "enviado",
          enviado_en: new Date().toISOString(),
          proveedor_id: resultado.proveedorId,
          bloqueado_hasta: null,
          ultimo_error: null,
        }
      : { estado: fila.intentos >= MAX_INTENTOS ? "fallido" : "pendiente", ultimo_error: resultado.codigo };

    if (resultado.ok) resumen.enviados += 1;
    else if (fila.intentos >= MAX_INTENTOS) resumen.fallidos += 1;
    else resumen.reintentos += 1;

    const { error: updateError } = await admin
      .from("clase_recordatorios")
      .update(cambios)
      .eq("id", fila.recordatorio_id);
    if (updateError) console.error("Failed to update clase_recordatorios:", updateError.message);

    await esperar(PAUSA_ENTRE_ENVIOS_MS);
  }

  const sinProcesar = lote.slice(procesados).map((f) => f.recordatorio_id);
  if (sinProcesar.length > 0) {
    const { error: liberarError } = await admin.rpc("liberar_recordatorios_clases", { p_ids: sinProcesar });
    if (liberarError) console.error("Failed to release clase_recordatorios:", liberarError.message);
    else resumen.liberados = sinProcesar.length;
  }

  return resumen;
}
