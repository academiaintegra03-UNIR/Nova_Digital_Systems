"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildIntegritySignature } from "@/lib/wompi";
import { readContactoForm } from "@/lib/validation/contacto";
import { isRateLimited } from "@/lib/rate-limit";
import type { DatosCuentaPago } from "@/lib/pagos/cuenta-del-pago";
import type { Json } from "@/lib/supabase/database.types";

export interface CheckoutState {
  error?: string;
  checkoutUrl?: string;
}

const RATE_LIMIT_IP = 10;
const RATE_LIMIT_CORREO = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Derives the real, reachable origin from the incoming request instead of a
 * static env var — works on localhost, any Vercel preview, and production
 * without configuration. (A hardcoded/placeholder site URL here is exactly
 * what sent Wompi's redirect to a domain that doesn't exist.)
 */
async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host");
  if (!host) return "http://localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Registers a `pending` payment and hands back a Wompi Web Checkout URL with
 * a server-computed integrity signature. No account exists until the webhook
 * (api/webhooks/wompi) receives a confirmed payment, so nobody can claim
 * someone else's email here, and the response never reveals whether an email
 * is already registered.
 */
export async function startCheckoutAction(formData: FormData): Promise<CheckoutState> {
  const planId = String(formData.get("plan_id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!planId || !nombre || !email) return { error: "Completa todos los campos." };
  if (!EMAIL_REGEX.test(email)) return { error: "El correo no es válido." };

  const contacto = readContactoForm(formData);
  if ("error" in contacto) return { error: contacto.error };

  const clientKey = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (
    (await isRateLimited(`checkout-ip:${clientKey}`, RATE_LIMIT_IP, RATE_LIMIT_WINDOW_MS)) ||
    (await isRateLimited(`checkout-correo:${email}`, RATE_LIMIT_CORREO, RATE_LIMIT_WINDOW_MS))
  ) {
    return { error: "Hiciste varios intentos seguidos. Espera unos minutos e intenta de nuevo." };
  }

  // .trim(): a stray trailing space/newline from copy-pasting the secret out
  // of Wompi's dashboard silently changes the hash and Wompi rejects it as
  // "firma inválida" with no other clue — this is the #1 real-world cause.
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.trim();
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET?.trim();
  if (!publicKey || !integritySecret) {
    return { error: "Los pagos todavía no están disponibles. Escríbenos por Contacto mientras tanto." };
  }

  const admin = createAdminClient();

  const { data: plan } = await admin.from("plans").select("*").eq("id", planId).eq("active", true).single();
  if (!plan) return { error: "Este plan ya no está disponible." };

  const reference = `ai-${randomUUID()}`;
  const amountInCents = plan.price_cop * 100;
  const datosCuenta: DatosCuentaPago = {
    telefono: contacto.data.telefono,
    tipoDocumento: contacto.data.tipoDocumento,
    numeroDocumento: contacto.data.numeroDocumento,
  };

  const { error: paymentError } = await admin.from("payments").insert({
    reference,
    plan_id: plan.id,
    email,
    nombre,
    amount_cop: plan.price_cop,
    status: "pending",
    datos_cuenta: datosCuenta as unknown as Json,
  });

  if (paymentError) {
    console.error("Failed to create payment:", paymentError.message);
    return { error: "No se pudo iniciar el pago." };
  }

  const signature = buildIntegritySignature({ reference, amountInCents, currency: "COP", integritySecret });
  const origin = await getOrigin();

  const params = new URLSearchParams({
    "public-key": publicKey,
    currency: "COP",
    "amount-in-cents": String(amountInCents),
    reference,
    "signature:integrity": signature,
    // Wompi appends its own `?id=` / `&env=` to this — our own `ref` rides
    // along so /checkout/gracias can look up the right payment.
    "redirect-url": `${origin}/checkout/gracias?ref=${encodeURIComponent(reference)}`,
  });

  return { checkoutUrl: `https://checkout.wompi.co/p/?${params.toString()}` };
}
