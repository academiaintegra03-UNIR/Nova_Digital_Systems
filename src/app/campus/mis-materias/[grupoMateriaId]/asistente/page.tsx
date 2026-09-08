import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGrupoMateriaContextForStudent } from "@/lib/queries/grupo-materias";
import { MateriaAsistenteChat } from "@/components/shared/materia-asistente-chat";

export default async function CampusMiMateriaAsistentePage({
  params,
}: PageProps<"/campus/mis-materias/[grupoMateriaId]/asistente">) {
  const { grupoMateriaId } = await params;
  const supabase = await createClient();
  const curso = await getGrupoMateriaContextForStudent(supabase, grupoMateriaId);
  if (!curso) notFound();

  return <MateriaAsistenteChat grupoMateriaId={grupoMateriaId} />;
}
