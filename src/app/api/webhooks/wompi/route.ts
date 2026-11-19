import { NextResponse, type NextRequest } from "next/server";
import { verifyWompiWebhookChecksum, type WompiEvent } from "@/lib/wompi";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateSubscription } from "@/lib/subscriptions";
import { getPaymentReceiptAction } from "@/app/checkout/gracias/actions";
import { sendReceiptEmail } from "@/lib/email/send-receipt-email";
import { sendCuentaCompraEmail } from "@/lib/email/send-cuenta-compra-email";
import { sendAvisoSoporte } from "@/lib/email/send-aviso-soporte";
import { resolverCuentaDelPago } from "@/lib/pagos/cuenta-del-pago";
import type { PaymentStatus } from "@/lib/supabase/database.types";

export const runtime = "nodejs";

interface WompiTransaction {
  id: string;
  status: string;
  reference: string;
  amount_in_cents?: number;
}

function mapWompiStatus(wompiStatus: string): PaymentStatus {
  switch (wompiStatus) {
    case "APPROVED":
      return "approved";
    case "DECLINED":
      return "declined";
    case "VOIDED":
      return "voided";
    case "ERROR":
      return "error";
    default:
      return "pending";
  }
}

const TERMINAL_STATUSES: PaymentStatus[] = ["approved", "declined", "error", "voided"];

export async function POST(request: NextRequest) {
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET?.trim();
  if (!eventsSecret) {
    console.error("WOMPI_EVENTS_SECRET is not set.");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  let event: WompiEvent;
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!event?.signature?.checksum) {
    console.error("Wompi webhook: missing signature — rejecting.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const checksumResult = verifyWompiWebhookChecksum(event, eventsSecret);
  if (!checksumResult.valid) {
    // Safe to log: debug never includes the events secret itself, only the
    // resolved property values and the two checksums being compared.
    console.error("Wompi webhook: checksum mismatch — rejecting.", checksumResult.debug);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Only transaction updates matter here; acknowledge anything else so
  // Wompi doesn't keep retrying an event we deliberately ignore.
  if (event.event !== "transaction.updated") {
    return NextResponse.json({ received: true });
  }

  const transaction = (event.data as { transaction?: WompiTransaction }).transaction;
  if (!transaction?.reference || !transaction.id || !transaction.status) {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();

  const { data: payment } = await admin.from("payments").select("*").eq("reference", transaction.reference).single();
  if (!payment) {
    console.error("Wompi webhook: no payment found for reference", transaction.reference);
    return NextResponse.json({ received: true });
  }

  // Idempotency: once a payment reaches a terminal status, further webhook
  // deliveries for the same reference (retries, duplicate sends) are no-ops.
  if (TERMINAL_STATUSES.includes(payment.status)) {
    return NextResponse.json({ received: true });
  }

  const status = mapWompiStatus(transaction.status);

  const guardarEstado = (nuevoEstado: PaymentStatus) =>
    admin
      .from("payments")
      .update({ status: nuevoEstado, wompi_transaction_id: transaction.id, raw_webhook: event })
      .eq("id", payment.id);
  const avisarSoporte = (titulo: string) =>
    sendAvisoSoporte({
      asunto: `Pago por revisar: ${titulo}`,
      titulo,
      filas: [
        ["Referencia", payment.reference],
        ["Nombre", payment.nombre],
        ["Correo", payment.email],
      ],
      replyTo: payment.email,
      adminPath: "/admin/pagos",
    });

  if (status !== "approved") {
    await guardarEstado(status);
    return NextResponse.json({ received: true });
  }

  // La firma prueba que el evento es de Wompi; esto, que se pagó el valor del plan.
  if (transaction.amount_in_cents !== payment.amount_cop * 100) {
    console.error("Wompi webhook: amount mismatch for reference", payment.reference);
    await guardarEstado("error");
    await avisarSoporte("El valor pagado no coincide con el plan");
    return NextResponse.json({ received: true });
  }

  const cuenta = await resolverCuentaDelPago(admin, payment);
  if (cuenta.tipo === "rol_incompatible") {
    await guardarEstado("approved");
    await avisarSoporte("Pago aprobado sin activar: el correo ya tiene una cuenta de otro rol");
    return NextResponse.json({ received: true });
  }
  // El pago sigue pendiente, así que el reintento de Wompi vuelve a pasar por aquí.
  if (cuenta.tipo === "error") {
    return NextResponse.json({ error: "Account provisioning failed" }, { status: 500 });
  }

  // Va antes de activar el plan: si algo falla después, el reintento ya no
  // conoce esta contraseña.
  if (cuenta.password && !(await sendCuentaCompraEmail(payment.email, payment.nombre, cuenta.password))) {
    await avisarSoporte("Pago aprobado: no se pudo enviar el correo con los datos de acceso");
  }

  const { error: subError } = await activateSubscription(cuenta.profileId, payment.plan_id);
  if (subError) {
    console.error("Wompi webhook: failed to activate subscription:", subError);
    return NextResponse.json({ error: "Subscription activation failed" }, { status: 500 });
  }

  await admin
    .from("payments")
    .update({
      status,
      wompi_transaction_id: transaction.id,
      raw_webhook: event,
      profile_id: cuenta.profileId,
      datos_cuenta: null,
    })
    .eq("id", payment.id);

  // Best-effort — sendReceiptEmail never throws, así que un correo que
  // falla no afecta la respuesta 200 que espera Wompi.
  const receipt = await getPaymentReceiptAction(payment.reference);
  if (receipt) await sendReceiptEmail(payment.email, receipt);

  return NextResponse.json({ received: true });
}
