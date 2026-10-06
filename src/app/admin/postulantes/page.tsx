import { createAdminClient } from "@/lib/supabase/admin";
import { PostulantesDashboard, type PostulanteAdminRow } from "@/features/admin/postulantes-dashboard";

async function getPostulantes(): Promise<PostulanteAdminRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("postulaciones_prueba_gratuita")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) {
    console.error("Failed to load postulaciones_prueba_gratuita:", error);
    return [];
  }

  return data.map((p) => ({
    id: p.id,
    createdAt: p.created_at,
    nombre: p.nombre,
    email: p.email,
    telefono: p.telefono,
    notificado: p.notificado,
  }));
}

export default async function AdminPostulantesPage() {
  const postulantes = await getPostulantes();

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Interesados que se postularon desde el popup del sitio público para recibir acceso a la prueba gratuita en
        cuanto se lance.
      </p>
      <PostulantesDashboard postulantes={postulantes} />
    </div>
  );
}
