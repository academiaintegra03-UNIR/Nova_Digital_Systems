import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { getInformesTutor } from "@/lib/queries/informes-tutor";
import { ReportsList } from "@/features/tutores/reports-list";

export default async function TutoresInformesPage() {
  const profile = await requireRole("tutor");
  const informes = await getInformesTutor(createAdminClient(), profile.id);
  return <ReportsList informes={informes} />;
}
