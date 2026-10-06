"use server";

import { headers } from "next/headers";
import { isRateLimited } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PostularPruebaGratuitaState {
  error?: string;
  success?: boolean;
}

const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function postularPruebaGratuitaAction(
  formData: FormData
): Promise<PostularPruebaGratuitaState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();

  if (!nombre || !email) {
    return { error: "Completa tu nombre y correo." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { error: "El correo no es válido." };
  }

  const clientKey = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`postulacion-prueba-gratuita:${clientKey}`, RATE_LIMIT, RATE_LIMIT_WINDOW_MS)) {
    return { error: "Enviaste varias postulaciones seguidas. Espera unos minutos e intenta de nuevo." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("postulaciones_prueba_gratuita").insert({
    nombre,
    email,
    telefono: telefono || null,
  });

  if (error) {
    console.error("Failed to insert postulación prueba gratuita:", error);
    return { error: "No se pudo enviar tu postulación. Intenta de nuevo en un momento." };
  }

  return { success: true };
}
