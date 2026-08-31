import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/require-role";
import { getGrupoMateriaContextForTutor } from "@/lib/queries/grupo-materias";
import { getClasesParaGrupos } from "@/lib/queries/clases";
import { getActividadesParaGrupoMateria } from "@/lib/queries/actividades";
import { getHilosParaGrupoMateria } from "@/lib/queries/foro";
import { StatCard } from "@/components/shared/stat-card";

export default async function TutorMateriaInicioPage({
  params,
}: PageProps<"/tutores/materias/[grupoMateriaId]">) {
  const { grupoMateriaId } = await params;
  const profile = await requireRole("tutor");
  const admin = createAdminClient();
  const curso = await getGrupoMateriaContextForTutor(admin, grupoMateriaId, profile.id);
  if (!curso) notFound();

  const [clases, actividades, hilos] = await Promise.all([
    getClasesParaGrupos(admin, [curso.grupoId], { materiaId: curso.materiaId, soloProximas: true }),
    getActividadesParaGrupoMateria(admin, curso.grupoId, curso.materiaId),
    getHilosParaGrupoMateria(admin, curso.grupoId, curso.materiaId),
  ]);

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        Este es el espacio de <strong>{curso.materiaNombre}</strong> para {curso.grupoNombre} — programa clases,
        crea actividades y responde el foro de tus estudiantes.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Próximas clases" value={String(clases.length)} />
        <StatCard label="Actividades" value={String(actividades.length)} />
        <StatCard label="Hilos en el foro" value={String(hilos.length)} />
      </div>
    </div>
  );
}
