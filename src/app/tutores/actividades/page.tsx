import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEntregasPorCalificar } from "@/lib/queries/actividades";
import { GradingList } from "@/features/tutores/grading-list";

export default async function TutoresActividadesPage() {
  const profile = await requireRole("tutor");
  const entregas = await getEntregasPorCalificar(createAdminClient(), profile.id);
  return <GradingList entregas={entregas} />;
}
