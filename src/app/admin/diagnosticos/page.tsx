import { createAdminClient } from "@/lib/supabase/admin";
import { DiagnosticosDashboard, type DiagnosticoAdminRow } from "@/features/admin/diagnosticos-dashboard";

async function getDiagnosticos(): Promise<DiagnosticoAdminRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("diagnosticos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("Failed to load diagnosticos:", error);
    return [];
  }

  return data.map((d) => ({
    id: d.id,
    createdAt: d.created_at,
    bancoId: d.banco_id,
    estudianteNombre: d.estudiante_nombre,
    estudianteEdad: d.estudiante_edad,
    colegio: d.colegio,
    puntajeGlobal: d.puntaje_global,
    aciertos: d.aciertos,
    totalPreguntas: d.total_preguntas,
    enfoqueScore: d.enfoque_score,
    perfilDominante: d.perfil_dominante,
    acudienteEmail: d.acudiente_email,
    acudienteTelefono: d.acudiente_telefono,
  }));
}

export default async function AdminDiagnosticosPage() {
  const diagnosticos = await getDiagnosticos();

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Leads capturados por la batería diagnóstica (pública en /diagnostico, y de estudiantes matriculados en
        /campus/diagnostico).
      </p>
      <DiagnosticosDashboard diagnosticos={diagnosticos} />
    </div>
  );
}
