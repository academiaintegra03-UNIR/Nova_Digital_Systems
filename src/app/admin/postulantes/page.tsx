import { createAdminClient } from "@/lib/supabase/admin";
import { PostulantesDashboard, type PostulanteAdminRow } from "@/features/admin/postulantes-dashboard";
import {
  calcularInforme,
  resumirIncidencias,
  type IncidenciaPrueba,
  type RespuestasPrueba,
} from "@/lib/prueba-gratuita/estado";

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

  const profileIds = data.map((p) => p.profile_id).filter((id): id is string => Boolean(id));
  const { data: pruebas } = profileIds.length
    ? await admin.from("pruebas_gratuitas").select("profile_id, respuestas, incidencias, finalizada_en").in("profile_id", profileIds)
    : { data: [] };
  const pruebaPorPerfil = new Map((pruebas ?? []).map((p) => [p.profile_id, p]));

  function resumenPrueba(profileId: string | null): PostulanteAdminRow["prueba"] {
    const prueba = profileId ? pruebaPorPerfil.get(profileId) : undefined;
    if (!prueba) return null;
    const informe = calcularInforme(prueba.respuestas as RespuestasPrueba);
    const correctas = informe.reduce((acc, m) => acc + m.correctas, 0);
    const total = informe.reduce((acc, m) => acc + m.total, 0);
    const incidencias = resumirIncidencias((prueba.incidencias ?? []) as unknown as IncidenciaPrueba[]);
    return {
      finalizada: Boolean(prueba.finalizada_en),
      porcentaje: total ? Math.round((correctas / total) * 100) : 0,
      salidasPestana: incidencias.pestana,
      copiaPegado: incidencias.copiaPegado,
    };
  }

  return data.map((p) => ({
    id: p.id,
    createdAt: p.created_at,
    nombre: p.nombre,
    email: p.email,
    telefono: p.telefono,
    notificado: p.notificado,
    notificadoEn: p.notificado_en,
    prueba: resumenPrueba(p.profile_id),
  }));
}

export default async function AdminPostulantesPage() {
  const postulantes = await getPostulantes();

  return (
    <div>
      <p className="mb-1.5 text-sm text-muted-foreground">
        Interesados que se postularon desde el popup del sitio público para recibir acceso a la prueba gratuita en
        cuanto se lance.
      </p>
      <p className="mb-4 text-sm text-muted-foreground">
        Al notificar se crea la cuenta del estudiante con una contraseña generada y se le envía por correo junto con
        el acceso — es de un solo uso: no se puede repetir ni ver esa contraseña después.
      </p>
      <PostulantesDashboard postulantes={postulantes} />
    </div>
  );
}
