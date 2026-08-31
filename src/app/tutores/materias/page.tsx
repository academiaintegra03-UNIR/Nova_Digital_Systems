import Link from "next/link";
import { Layers } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import { getGrupoMateriasParaGrupos } from "@/lib/queries/grupo-materias";
import type { GrupoMateriaRow, Materia } from "@/lib/types/panels";
import { Card, CardContent } from "@/components/ui/card";
import { AddMateriaToGrupoDialog } from "@/features/tutores/add-materia-to-grupo-dialog";
import { RemoveMateriaButton } from "@/features/tutores/remove-materia-button";

interface TutorMateriasData {
  grupos: { id: string; name: string }[];
  grupoMaterias: GrupoMateriaRow[];
  materias: Materia[];
}

async function getTutorMateriasData(tutorId: string): Promise<TutorMateriasData> {
  const admin = createAdminClient();

  const { data: grupoRows, error: gruposError } = await admin
    .from("grupos")
    .select("id, name")
    .eq("tutor_id", tutorId)
    .order("name");
  if (gruposError) console.error("Failed to load grupos for tutor materias:", gruposError);

  const grupoMaterias = await getGrupoMateriasParaGrupos(admin, [], { soloTutorId: tutorId });

  const { data: materias, error: materiasError } = await admin.from("materias").select("id, name").order("name");
  if (materiasError) console.error("Failed to load materias:", materiasError);

  return { grupos: grupoRows ?? [], grupoMaterias, materias: materias ?? [] };
}

export default async function TutorMateriasPage() {
  const profile = await getAuthenticatedProfile();
  const { grupos, grupoMaterias, materias } = profile
    ? await getTutorMateriasData(profile.id)
    : { grupos: [], grupoMaterias: [], materias: [] };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {grupos.length === 0
            ? "Todavía no tienes grupos asignados — pídele al administrador que te asigne uno."
            : "Cada materia es un espacio con sus propias clases y actividades."}
        </p>
        {grupos.length > 0 ? <AddMateriaToGrupoDialog grupos={grupos} materias={materias} /> : null}
      </div>

      {grupoMaterias.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
            <Layers className="mb-2 size-6" aria-hidden="true" />
            {grupos.length === 0 ? "Sin grupos asignados todavía." : "Todavía no le has agregado materias a tus grupos."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {grupoMaterias.map((gm) => (
            <Card key={gm.id} className="relative">
              <CardContent className="py-5">
                <Link href={`/tutores/materias/${gm.id}`} className="block">
                  <div className="mb-1 text-xs text-muted-foreground">{gm.grupoNombre}</div>
                  <div className="text-base font-bold text-primary">{gm.materiaNombre}</div>
                </Link>
                <div className="absolute right-2 top-2">
                  <RemoveMateriaButton id={gm.id} label={gm.materiaNombre} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
