import type { Metadata } from "next";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import { getContextoEstudianteDiagnostico } from "@/lib/diagnostico/contexto-estudiante";
import { DiagnosticTeaser } from "@/features/diagnostico/diagnostic-teaser";

export const metadata: Metadata = { title: "Diagnóstico académico" };

export default async function DiagnosticPage() {
  // Ruta pública — pero si quien entra ya está logueado como estudiante,
  // se le reconoce igual que en /campus/diagnostico (se salta el
  // formulario de lead y ve los cursos pagos si tiene matrícula activa).
  // Un visitante sin sesión sigue el flujo anónimo de siempre.
  const profile = await getAuthenticatedProfile();
  const contexto = profile?.role === "estudiante" ? await getContextoEstudianteDiagnostico(profile) : null;

  return (
    <DiagnosticTeaser
      cuentaConocida={contexto?.cuentaConocida}
      bateriasPagasHabilitadas={contexto?.bateriasPagasHabilitadas ?? false}
    />
  );
}
