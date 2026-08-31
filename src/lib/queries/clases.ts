import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ClaseRow } from "@/lib/types/panels";

interface GetClasesParaGruposOptions {
  /** En vez de filtrar por grupoIds, trae las clases de un tutor puntual
   * (usado por la Agenda del tutor, donde importa lo que él programó,
   * no todo lo del grupo). */
  soloTutorId?: string;
  /** Acota además a una materia puntual — usado por la página "curso"
   * de grupo+materia (tutor y estudiante). */
  materiaId?: string;
  /** No aplica ningún `.in("grupo_id", ...)` — se usa con el cliente
   * normal (RLS), cuando la policy de `clases` ya hace el filtro sola
   * (estudiante viendo sus propias clases vía `grupo_ids_for_student`).
   * Sin esto, pasar un `grupoIds` vacío devolvería siempre []. */
  confiarEnRLS?: boolean;
  soloProximas?: boolean;
  limit?: number;
}

/** Resuelve `clases` + los nombres de grupo/materia/tutor, mismo shape
 * (`ClaseRow`) para las vistas de admin, tutor, estudiante, acudiente y
 * colegio. Acepta tanto el cliente con RLS normal (ya limitado por las
 * policies del estudiante) como el admin client (colegio/acudiente, que
 * no tienen policy propia sobre `clases` y filtran explícito por sus
 * propios grupoIds). */
export async function getClasesParaGrupos(
  client: SupabaseClient<Database>,
  grupoIds: string[],
  opts: GetClasesParaGruposOptions = {}
): Promise<ClaseRow[]> {
  if (!opts.soloTutorId && !opts.confiarEnRLS && grupoIds.length === 0) return [];

  let query = client.from("clases").select("*").order("scheduled_at", { ascending: true });
  if (opts.soloTutorId) {
    query = query.eq("tutor_id", opts.soloTutorId);
  } else if (!opts.confiarEnRLS) {
    query = query.in("grupo_id", grupoIds);
  }
  if (opts.materiaId) query = query.eq("materia_id", opts.materiaId);
  if (opts.soloProximas) query = query.gte("scheduled_at", new Date().toISOString());
  if (opts.limit) query = query.limit(opts.limit);

  const { data: claseRows, error } = await query;
  if (error) {
    console.error("Failed to load clases:", error);
    return [];
  }
  if (!claseRows || claseRows.length === 0) return [];

  const resolvedGrupoIds = Array.from(new Set(claseRows.map((c) => c.grupo_id)));
  const materiaIds = Array.from(new Set(claseRows.map((c) => c.materia_id)));
  const tutorIds = Array.from(new Set(claseRows.map((c) => c.tutor_id).filter((id): id is string => Boolean(id))));

  const [{ data: grupos }, { data: materias }, { data: tutores }] = await Promise.all([
    resolvedGrupoIds.length > 0
      ? client.from("grupos").select("id, name").in("id", resolvedGrupoIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    materiaIds.length > 0
      ? client.from("materias").select("id, name").in("id", materiaIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    tutorIds.length > 0
      ? client.from("profiles").select("id, nombre").in("id", tutorIds)
      : Promise.resolve({ data: [] as { id: string; nombre: string }[] }),
  ]);

  const grupoNombreById = new Map((grupos ?? []).map((g) => [g.id, g.name]));
  const materiaNombreById = new Map((materias ?? []).map((m) => [m.id, m.name]));
  const tutorNombreById = new Map((tutores ?? []).map((t) => [t.id, t.nombre]));

  return claseRows.map((c) => ({
    id: c.id,
    grupoId: c.grupo_id,
    grupoNombre: grupoNombreById.get(c.grupo_id) ?? "Grupo eliminado",
    materiaId: c.materia_id,
    materiaNombre: materiaNombreById.get(c.materia_id) ?? "Materia eliminada",
    tutorId: c.tutor_id,
    tutorNombre: c.tutor_id ? (tutorNombreById.get(c.tutor_id) ?? null) : null,
    nombre: c.nombre,
    scheduledAt: c.scheduled_at,
    durationMinutes: c.duration_minutes,
    meetingLink: c.meeting_link,
    recordingLink: c.recording_link,
  }));
}
