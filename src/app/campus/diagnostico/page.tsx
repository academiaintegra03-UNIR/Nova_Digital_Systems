import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/require-role";
import { getContextoEstudianteDiagnostico } from "@/lib/diagnostico/contexto-estudiante";
import { DiagnosticTeaser } from "@/features/diagnostico/diagnostic-teaser";

export const metadata: Metadata = { title: "Diagnóstico académico" };

export default async function CampusDiagnosticoPage() {
  const profile = await requireRole("estudiante");
  const { cuentaConocida, bateriasPagasHabilitadas } = await getContextoEstudianteDiagnostico(profile);

  return <DiagnosticTeaser cuentaConocida={cuentaConocida} bateriasPagasHabilitadas={bateriasPagasHabilitadas} />;
}
