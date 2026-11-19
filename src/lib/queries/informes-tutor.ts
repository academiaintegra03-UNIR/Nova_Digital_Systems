import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { InformeGrupoTutor } from "@/lib/types/panels";

function promedio(notas: number[]): number | null {
  if (notas.length === 0) return null;
  return Math.round((notas.reduce((acc, n) => acc + n, 0) / notas.length) * 10) / 10;
}

/** Avance por grupo y materia de las actividades de un tutor: entregas
 * realizadas y promedio de notas de cada estudiante. */
export async function getInformesTutor(
  admin: SupabaseClient<Database>,
  tutorId: string
): Promise<InformeGrupoTutor[]> {
  const { data: actividades, error } = await admin
    .from("actividades")
    .select("id, grupo_id, materia_id")
    .eq("tutor_id", tutorId);
  if (error) {
    console.error("Failed to load actividades for informes:", error);
    return [];
  }
  if (!actividades || actividades.length === 0) return [];

  const actividadIds = actividades.map((a) => a.id);
  const grupoIds = Array.from(new Set(actividades.map((a) => a.grupo_id)));
  const materiaIds = Array.from(new Set(actividades.map((a) => a.materia_id)));

  const [entregasRes, miembrosRes, gruposRes, materiasRes] = await Promise.all([
    admin
      .from("actividad_entregas")
      .select("actividad_id, student_id, nota")
      .in("actividad_id", actividadIds)
      .eq("estado", "entregada"),
    admin.from("grupo_estudiantes").select("grupo_id, student_id").in("grupo_id", grupoIds),
    admin.from("grupos").select("id, name").in("id", grupoIds),
    admin.from("materias").select("id, name").in("id", materiaIds),
  ]);
  if (entregasRes.error || miembrosRes.error) {
    console.error("Failed to load informes:", entregasRes.error ?? miembrosRes.error);
    return [];
  }

  const miembros = miembrosRes.data ?? [];
  const studentIds = Array.from(new Set(miembros.map((m) => m.student_id)));
  const { data: perfiles } = studentIds.length
    ? await admin.from("profiles").select("id, nombre").in("id", studentIds)
    : { data: [] };

  const nombrePorEstudiante = new Map((perfiles ?? []).map((p) => [p.id, p.nombre]));
  const nombrePorGrupo = new Map((gruposRes.data ?? []).map((g) => [g.id, g.name]));
  const nombrePorMateria = new Map((materiasRes.data ?? []).map((m) => [m.id, m.name]));

  const actividadesPorCurso = new Map<string, typeof actividades>();
  for (const actividad of actividades) {
    const clave = `${actividad.grupo_id}:${actividad.materia_id}`;
    actividadesPorCurso.set(clave, [...(actividadesPorCurso.get(clave) ?? []), actividad]);
  }

  return Array.from(actividadesPorCurso, ([clave, delCurso]) => {
    const { grupo_id: grupoId, materia_id: materiaId } = delCurso[0];
    const idsDelCurso = new Set(delCurso.map((a) => a.id));
    const entregas = (entregasRes.data ?? []).filter((e) => idsDelCurso.has(e.actividad_id));

    const estudiantes = miembros
      .filter((m) => m.grupo_id === grupoId)
      .map((m) => {
        const propias = entregas.filter((e) => e.student_id === m.student_id);
        return {
          studentId: m.student_id,
          nombre: nombrePorEstudiante.get(m.student_id) ?? "Estudiante",
          entregadas: propias.length,
          promedio: promedio(propias.flatMap((e) => (e.nota === null ? [] : [Number(e.nota)]))),
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    return {
      clave,
      grupoNombre: nombrePorGrupo.get(grupoId) ?? "Grupo",
      materiaNombre: nombrePorMateria.get(materiaId) ?? "Materia",
      totalActividades: delCurso.length,
      promedioGrupo: promedio(entregas.flatMap((e) => (e.nota === null ? [] : [Number(e.nota)]))),
      estudiantes,
    };
  }).sort((a, b) => `${a.grupoNombre}${a.materiaNombre}`.localeCompare(`${b.grupoNombre}${b.materiaNombre}`, "es"));
}
