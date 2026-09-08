import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { DiagnosticTeaser } from "@/features/diagnostico/diagnostic-teaser";

export const metadata: Metadata = { title: "Diagnóstico académico" };

export default async function CampusDiagnosticoPage() {
  const profile = await requireRole("estudiante");
  const supabase = await createClient();

  const { data: own } = await supabase.from("profiles").select("colegio_id").eq("id", profile.id).maybeSingle();
  const { data: colegio } = own?.colegio_id
    ? await supabase.from("profiles").select("nombre").eq("id", own.colegio_id).maybeSingle()
    : { data: null };

  return (
    <DiagnosticTeaser
      cuentaConocida={{
        nombre: profile.nombre,
        colegio: colegio?.nombre ?? null,
        email: null,
      }}
    />
  );
}
