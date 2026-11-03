import "server-only";

import { cache } from "react";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/session";

/**
 * Returns the signed-in user's profile, or `null` if signed out.
 * `React.cache()` dedupes this within a single request — every layout in the
 * tree (marketing header, dashboard shell, page) can call it without
 * triggering a repeat round-trip to Supabase.
 *
 * Uses `getUser()`, not `getSession()`: it revalidates the JWT against the
 * Supabase server instead of trusting a cookie that could be stale/forged.
 */
export const getAuthenticatedProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (!user) {
    // Sin conexión con Supabase no se sabe si hay sesión: devolver null
    // mandaría a /login a alguien que sí la tiene (ej. a mitad de la prueba
    // gratuita al irse el internet). Mejor un error que se pueda reintentar.
    if (authError && isAuthRetryableFetchError(authError)) {
      throw new Error("No se pudo verificar la sesión: sin conexión con el servidor de autenticación.");
    }
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, nombre")
    .eq("id", user.id)
    .single();

  if (error) console.error("Failed to load authenticated profile:", error);

  return profile;
});
