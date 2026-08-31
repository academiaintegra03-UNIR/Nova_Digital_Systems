import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGrupoMateriaContextForStudent } from "@/lib/queries/grupo-materias";
import { getClasesParaGrupos } from "@/lib/queries/clases";
import { getActividadesParaGrupoMateria, getMisEntregas } from "@/lib/queries/actividades";
import { getHilosParaGrupoMateria } from "@/lib/queries/foro";
import { StatCard } from "@/components/shared/stat-card";

export default async function CampusMiMateriaInicioPage({
  params,
}: PageProps<"/campus/mis-materias/[grupoMateriaId]">) {
  const { grupoMateriaId } = await params;
  const supabase = await createClient();
  const curso = await getGrupoMateriaContextForStudent(supabase, grupoMateriaId);
  if (!curso) notFound();

  const [clases, actividades, hilos] = await Promise.all([
    getClasesParaGrupos(supabase, [], { confiarEnRLS: true, materiaId: curso.materiaId, soloProximas: true }),
    getActividadesParaGrupoMateria(supabase, curso.grupoId, curso.materiaId),
    getHilosParaGrupoMateria(supabase, curso.grupoId, curso.materiaId),
  ]);
  const misEntregas = await getMisEntregas(
    supabase,
    actividades.map((a) => a.id)
  );
  const pendientes = actividades.filter((a) => misEntregas.get(a.id)?.estado !== "entregada").length;

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        Este es el espacio de <strong>{curso.materiaNombre}</strong> para {curso.grupoNombre} — revisa tus
        clases, entrega tus actividades y pregunta en el foro.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Próximas clases" value={String(clases.length)} />
        <StatCard label="Actividades pendientes" value={String(pendientes)} />
        <StatCard label="Hilos en el foro" value={String(hilos.length)} />
      </div>
    </div>
  );
}
