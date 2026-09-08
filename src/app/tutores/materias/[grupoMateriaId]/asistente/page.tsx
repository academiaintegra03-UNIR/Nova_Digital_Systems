import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/require-role";
import { getGrupoMateriaContextForTutor } from "@/lib/queries/grupo-materias";
import { MateriaAsistenteChat } from "@/components/shared/materia-asistente-chat";

export default async function TutorMateriaAsistentePage({
  params,
}: PageProps<"/tutores/materias/[grupoMateriaId]/asistente">) {
  const { grupoMateriaId } = await params;
  const profile = await requireRole("tutor");
  const admin = createAdminClient();
  const curso = await getGrupoMateriaContextForTutor(admin, grupoMateriaId, profile.id);
  if (!curso) notFound();

  return <MateriaAsistenteChat grupoMateriaId={grupoMateriaId} />;
}
