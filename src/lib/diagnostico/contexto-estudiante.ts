import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription } from "@/lib/queries/subscription";
import type { Profile } from "@/lib/types/session";
import type { CuentaConocida } from "@/features/diagnostico/diagnostic-teaser";

export interface ContextoEstudianteDiagnostico {
  cuentaConocida: CuentaConocida;
  bateriasPagasHabilitadas: boolean;
}

/**
 * Resuelve, para un estudiante logueado, los datos que ya conoce la
 * cuenta (para saltarse el formulario de lead) y si tiene matrícula
 * activa (suscripción individual) que habilite los cursos pagos por
 * grado. Usado tanto por `/diagnostico` (público, pero reconoce a un
 * visitante logueado) como por `/campus/diagnostico` (siempre logueado).
 */
export async function getContextoEstudianteDiagnostico(profile: Profile): Promise<ContextoEstudianteDiagnostico> {
  const supabase = await createClient();

  const { data: own } = await supabase.from("profiles").select("colegio_id").eq("id", profile.id).maybeSingle();
  const { data: colegio } = own?.colegio_id
    ? await supabase.from("profiles").select("nombre").eq("id", own.colegio_id).maybeSingle()
    : { data: null };

  const suscripcion = await getActiveSubscription(profile.id, "individual");

  return {
    cuentaConocida: { nombre: profile.nombre, colegio: colegio?.nombre ?? null, email: null },
    bateriasPagasHabilitadas: Boolean(suscripcion),
  };
}
