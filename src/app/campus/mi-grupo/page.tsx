import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import type { MiGrupoRow } from "@/lib/types/panels";
import { Card, CardContent } from "@/components/ui/card";

async function getMisGrupos(studentId: string): Promise<MiGrupoRow[]> {
  const supabase = await createClient();

  // Sin filtro por estudiante a propósito: la policy "Los estudiantes ven
  // la membresía de sus grupos" (0009) ya limita esto, vía RLS, a los
  // grupos donde el estudiante actual participa — es lo que permite listar
  // también a los compañeros, no solo la propia fila.
  const { data: memberships, error: membershipsError } = await supabase
    .from("grupo_estudiantes")
    .select("grupo_id, student_id");
  if (membershipsError) {
    console.error("Failed to load grupo_estudiantes for student:", membershipsError);
    return [];
  }
  if (!memberships || memberships.length === 0) return [];

  const grupoIds = Array.from(new Set(memberships.map((m) => m.grupo_id)));

  const { data: grupos, error: gruposError } = await supabase
    .from("grupos")
    .select("id, name, tutor_id")
    .in("id", grupoIds);
  if (gruposError) {
    console.error("Failed to load grupos for student:", gruposError);
    return [];
  }

  const studentIdsByGrupo = new Map<string, string[]>();
  for (const m of memberships) {
    const existing = studentIdsByGrupo.get(m.grupo_id) ?? [];
    existing.push(m.student_id);
    studentIdsByGrupo.set(m.grupo_id, existing);
  }

  const allProfileIds = Array.from(
    new Set([
      ...memberships.map((m) => m.student_id),
      ...(grupos ?? []).map((g) => g.tutor_id).filter((id): id is string => Boolean(id)),
    ])
  );

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, nombre")
    .in("id", allProfileIds);
  if (profilesError) console.error("Failed to load profiles for grupos:", profilesError);

  const nombreById = new Map((profiles ?? []).map((p) => [p.id, p.nombre]));

  return (grupos ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    tutorNombre: g.tutor_id ? (nombreById.get(g.tutor_id) ?? null) : null,
    companeros: (studentIdsByGrupo.get(g.id) ?? [])
      .filter((id) => id !== studentId)
      .map((id) => nombreById.get(id) ?? "Estudiante")
      .sort((a, b) => a.localeCompare(b)),
  }));
}

export default async function CampusMiGrupoPage() {
  const profile = await getAuthenticatedProfile();
  const grupos = profile ? await getMisGrupos(profile.id) : [];

  if (grupos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <Users className="mb-3 size-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="mb-1.5 text-lg font-extrabold text-heading">Aún no estás en ningún grupo</h1>
          <p className="text-sm text-muted-foreground">
            Cuando el administrador te asigne a un grupo, lo vas a ver aquí junto con tu tutor y tus
            compañeros.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {grupos.map((grupo) => (
        <Card key={grupo.id}>
          <CardContent>
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-heading">{grupo.name}</h3>
              <span className="text-xs text-muted-foreground">Tutor: {grupo.tutorNombre ?? "Sin asignar"}</span>
            </div>
            {grupo.companeros.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {grupo.companeros.map((nombre) => (
                  <span
                    key={nombre}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground"
                  >
                    {nombre}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Todavía no hay más estudiantes en este grupo.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
