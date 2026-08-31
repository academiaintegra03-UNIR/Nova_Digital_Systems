import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ActividadEntregaEstudiante, ActividadEntregaRoster, ActividadRow } from "@/lib/types/panels";

/** Actividades de un grupo+materia puntual (la página "curso" ya conoce
 * ambos ids por contexto, a diferencia de clases que se listan por grupo
 * completo). */
export async function getActividadesParaGrupoMateria(
  client: SupabaseClient<Database>,
  grupoId: string,
  materiaId: string
): Promise<ActividadRow[]> {
  const { data, error } = await client
    .from("actividades")
    .select("*")
    .eq("grupo_id", grupoId)
    .eq("materia_id", materiaId)
    .order("fecha_limite", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("Failed to load actividades:", error);
    return [];
  }

  return (data ?? []).map((a) => ({
    id: a.id,
    grupoId: a.grupo_id,
    materiaId: a.materia_id,
    tutorId: a.tutor_id,
    titulo: a.titulo,
    descripcion: a.descripcion,
    fechaLimite: a.fecha_limite,
    recursoLink: a.recurso_link,
    createdAt: a.created_at,
  }));
}

/** Vista del tutor: cada estudiante del grupo con su estado de entrega
 * para una actividad puntual — cruza el roster del grupo (grupo_estudiantes)
 * con las filas que sí existen en actividad_entregas (ausencia = pendiente). */
export async function getEntregaRosterParaActividad(
  admin: SupabaseClient<Database>,
  actividadId: string,
  grupoId: string
): Promise<ActividadEntregaRoster[]> {
  const { data: memberships, error: membershipsError } = await admin
    .from("grupo_estudiantes")
    .select("student_id")
    .eq("grupo_id", grupoId);
  if (membershipsError) console.error("Failed to load grupo_estudiantes for roster:", membershipsError);
  if (!memberships || memberships.length === 0) return [];

  const studentIds = memberships.map((m) => m.student_id);

  const [{ data: profiles }, { data: entregas }] = await Promise.all([
    admin.from("profiles").select("id, nombre").in("id", studentIds),
    admin.from("actividad_entregas").select("*").eq("actividad_id", actividadId).in("student_id", studentIds),
  ]);

  const nombreById = new Map((profiles ?? []).map((p) => [p.id, p.nombre]));
  const entregaByStudent = new Map((entregas ?? []).map((e) => [e.student_id, e]));

  return studentIds.map((studentId) => {
    const entrega = entregaByStudent.get(studentId);
    return {
      studentId,
      studentNombre: nombreById.get(studentId) ?? "Estudiante",
      estado: entrega?.estado ?? "pendiente",
      entregadoAt: entrega?.entregado_at ?? null,
      respuestaLink: entrega?.respuesta_link ?? null,
    };
  });
}

/** Vista del estudiante: su propia entrega (o su ausencia = pendiente)
 * para una lista de actividades — cliente RLS normal, la policy
 * "estudiante ve sus propias entregas" (0016) ya limita a `student_id =
 * auth.uid()`. */
export async function getMisEntregas(
  client: SupabaseClient<Database>,
  actividadIds: string[]
): Promise<Map<string, ActividadEntregaEstudiante>> {
  if (actividadIds.length === 0) return new Map();

  const { data, error } = await client.from("actividad_entregas").select("*").in("actividad_id", actividadIds);
  if (error) {
    console.error("Failed to load mis entregas:", error);
    return new Map();
  }

  return new Map(
    (data ?? []).map((e) => [
      e.actividad_id,
      {
        actividadId: e.actividad_id,
        estado: e.estado,
        entregadoAt: e.entregado_at,
        respuestaLink: e.respuesta_link,
      },
    ])
  );
}
