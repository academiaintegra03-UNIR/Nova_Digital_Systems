import { createAdminClient } from "@/lib/supabase/admin";
import { createClaseAction, updateClaseAction } from "@/app/admin/clases/actions";
import type { AdminGrupoRow, ClaseRow, Materia, TutorOption } from "@/lib/types/panels";
import { Button } from "@/components/ui/button";
import { ClaseFormDialog } from "@/features/admin/clase-form-dialog";
import { ClasesTable } from "@/features/admin/clases-table";

interface ClasesPageData {
  clases: ClaseRow[];
  grupos: Pick<AdminGrupoRow, "id" | "name" | "colegioNombre" | "tutorId">[];
  materias: Materia[];
  tutores: TutorOption[];
}

async function getClasesPageData(): Promise<ClasesPageData> {
  const admin = createAdminClient();

  const { data: profiles } = await admin.from("profiles").select("id, nombre, role");
  const nombreById = new Map((profiles ?? []).map((p) => [p.id, p.nombre]));

  const { data: grupoRows, error: gruposError } = await admin
    .from("grupos")
    .select("id, name, colegio_id, tutor_id")
    .order("name");
  if (gruposError) console.error("Failed to load grupos for clases:", gruposError);

  const grupos = (grupoRows ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    colegioNombre: g.colegio_id ? (nombreById.get(g.colegio_id) ?? null) : null,
    tutorId: g.tutor_id,
  }));
  const grupoById = new Map(grupos.map((g) => [g.id, g]));

  const { data: materias, error: materiasError } = await admin.from("materias").select("id, name").order("name");
  if (materiasError) console.error("Failed to load materias for clases:", materiasError);
  const materiaById = new Map((materias ?? []).map((m) => [m.id, m]));

  const tutores: TutorOption[] = (profiles ?? [])
    .filter((p) => p.role === "tutor")
    .map((p) => ({ id: p.id, nombre: p.nombre }));

  const { data: claseRows, error: clasesError } = await admin
    .from("clases")
    .select("*")
    .order("scheduled_at", { ascending: false });
  if (clasesError) console.error("Failed to load clases:", clasesError);

  const clases: ClaseRow[] = (claseRows ?? []).map((c) => ({
    id: c.id,
    grupoId: c.grupo_id,
    grupoNombre: grupoById.get(c.grupo_id)?.name ?? "Grupo eliminado",
    materiaId: c.materia_id,
    materiaNombre: materiaById.get(c.materia_id)?.name ?? "Materia eliminada",
    tutorId: c.tutor_id,
    tutorNombre: c.tutor_id ? (nombreById.get(c.tutor_id) ?? null) : null,
    nombre: c.nombre,
    scheduledAt: c.scheduled_at,
    durationMinutes: c.duration_minutes,
    meetingLink: c.meeting_link,
    recordingLink: c.recording_link,
  }));

  return { clases, grupos, materias: materias ?? [], tutores };
}

export default async function AdminClasesPage() {
  const { clases, grupos, materias, tutores } = await getClasesPageData();

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <ClaseFormDialog
          grupos={grupos}
          materias={materias}
          tutores={tutores}
          createAction={createClaseAction}
          updateAction={updateClaseAction}
          trigger={<Button size="sm">+ Programar clase</Button>}
        />
      </div>
      <ClasesTable clases={clases} grupos={grupos} materias={materias} tutores={tutores} />
    </div>
  );
}
