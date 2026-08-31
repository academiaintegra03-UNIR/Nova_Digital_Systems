import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { GrupoMateriaRow } from "@/lib/types/panels";

interface GetGrupoMateriasOptions {
  soloTutorId?: string;
  confiarEnRLS?: boolean;
}

/** Resuelve `grupo_materias` + nombres de grupo/materia — mismo patrón
 * que `getClasesParaGrupos` (src/lib/queries/clases.ts). */
export async function getGrupoMateriasParaGrupos(
  client: SupabaseClient<Database>,
  grupoIds: string[],
  opts: GetGrupoMateriasOptions = {}
): Promise<GrupoMateriaRow[]> {
  if (!opts.soloTutorId && !opts.confiarEnRLS && grupoIds.length === 0) return [];

  let query = client.from("grupo_materias").select("*").order("created_at", { ascending: true });
  if (opts.soloTutorId) {
    query = query.eq("tutor_id", opts.soloTutorId);
  } else if (!opts.confiarEnRLS) {
    query = query.in("grupo_id", grupoIds);
  }

  const { data: rows, error } = await query;
  if (error) {
    console.error("Failed to load grupo_materias:", error);
    return [];
  }
  if (!rows || rows.length === 0) return [];

  const resolvedGrupoIds = Array.from(new Set(rows.map((r) => r.grupo_id)));
  const materiaIds = Array.from(new Set(rows.map((r) => r.materia_id)));

  const [{ data: grupos }, { data: materias }] = await Promise.all([
    client.from("grupos").select("id, name").in("id", resolvedGrupoIds),
    client.from("materias").select("id, name").in("id", materiaIds),
  ]);

  const grupoNombreById = new Map((grupos ?? []).map((g) => [g.id, g.name]));
  const materiaNombreById = new Map((materias ?? []).map((m) => [m.id, m.name]));

  return rows.map((r) => ({
    id: r.id,
    grupoId: r.grupo_id,
    grupoNombre: grupoNombreById.get(r.grupo_id) ?? "Grupo eliminado",
    materiaId: r.materia_id,
    materiaNombre: materiaNombreById.get(r.materia_id) ?? "Materia eliminada",
  }));
}

export interface GrupoMateriaContext {
  grupoId: string;
  grupoNombre: string;
  materiaId: string;
  materiaNombre: string;
}

/** Contexto de un curso (grupo+materia) puntual para el tutor dueño —
 * null si el `grupoMateriaId` no existe o no es de ese tutor. Usado por
 * el layout y cada pestaña de `/tutores/materias/[grupoMateriaId]/*`. */
export async function getGrupoMateriaContextForTutor(
  admin: SupabaseClient<Database>,
  grupoMateriaId: string,
  tutorId: string
): Promise<GrupoMateriaContext | null> {
  const { data: grupoMateria } = await admin
    .from("grupo_materias")
    .select("grupo_id, materia_id, tutor_id")
    .eq("id", grupoMateriaId)
    .single();
  if (!grupoMateria || grupoMateria.tutor_id !== tutorId) return null;

  const [{ data: grupo }, { data: materia }] = await Promise.all([
    admin.from("grupos").select("name").eq("id", grupoMateria.grupo_id).single(),
    admin.from("materias").select("name").eq("id", grupoMateria.materia_id).single(),
  ]);

  return {
    grupoId: grupoMateria.grupo_id,
    grupoNombre: grupo?.name ?? "Grupo",
    materiaId: grupoMateria.materia_id,
    materiaNombre: materia?.name ?? "Materia",
  };
}

/** Mismo contexto para el estudiante — cliente RLS normal; devuelve null
 * si la policy "estudiante ve materias de sus grupos" (0016) no le deja
 * ver ese `grupoMateriaId` (no es de un grupo suyo). */
export async function getGrupoMateriaContextForStudent(
  client: SupabaseClient<Database>,
  grupoMateriaId: string
): Promise<GrupoMateriaContext | null> {
  const { data: grupoMateria } = await client
    .from("grupo_materias")
    .select("grupo_id, materia_id")
    .eq("id", grupoMateriaId)
    .maybeSingle();
  if (!grupoMateria) return null;

  const [{ data: grupo }, { data: materia }] = await Promise.all([
    client.from("grupos").select("name").eq("id", grupoMateria.grupo_id).maybeSingle(),
    client.from("materias").select("name").eq("id", grupoMateria.materia_id).maybeSingle(),
  ]);

  return {
    grupoId: grupoMateria.grupo_id,
    grupoNombre: grupo?.name ?? "Grupo",
    materiaId: grupoMateria.materia_id,
    materiaNombre: materia?.name ?? "Materia",
  };
}
