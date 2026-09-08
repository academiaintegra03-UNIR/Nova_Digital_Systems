import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { RecursoRow } from "@/lib/types/panels";

export async function getRecursosParaGrupoMateria(
  client: SupabaseClient<Database>,
  grupoId: string,
  materiaId: string
): Promise<RecursoRow[]> {
  const { data, error } = await client
    .from("materia_recursos")
    .select("*")
    .eq("grupo_id", grupoId)
    .eq("materia_id", materiaId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load materia_recursos:", error);
    return [];
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    grupoId: r.grupo_id,
    materiaId: r.materia_id,
    titulo: r.titulo,
    tipo: r.tipo,
    url: r.url,
    createdAt: r.created_at,
  }));
}
