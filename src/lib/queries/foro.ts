import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ForoHiloRow, ForoMensajeRow } from "@/lib/types/panels";

/** Hilos del foro de un grupo+materia, con el nombre del autor, la
 * cantidad de mensajes y la fecha de la última actividad ya resueltos. */
export async function getHilosParaGrupoMateria(
  client: SupabaseClient<Database>,
  grupoId: string,
  materiaId: string
): Promise<ForoHiloRow[]> {
  const { data: hilos, error } = await client
    .from("foro_hilos")
    .select("*")
    .eq("grupo_id", grupoId)
    .eq("materia_id", materiaId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load foro_hilos:", error);
    return [];
  }
  if (!hilos || hilos.length === 0) return [];

  const hiloIds = hilos.map((h) => h.id);
  const autorIds = Array.from(new Set(hilos.map((h) => h.autor_id).filter((id): id is string => Boolean(id))));

  const [{ data: mensajes }, { data: autores }] = await Promise.all([
    client.from("foro_mensajes").select("hilo_id, created_at").in("hilo_id", hiloIds),
    autorIds.length > 0
      ? client.from("profiles").select("id, nombre").in("id", autorIds)
      : Promise.resolve({ data: [] as { id: string; nombre: string }[] }),
  ]);

  const autorNombreById = new Map((autores ?? []).map((a) => [a.id, a.nombre]));
  const countByHilo = new Map<string, number>();
  const ultimaByHilo = new Map<string, string>();
  for (const m of mensajes ?? []) {
    countByHilo.set(m.hilo_id, (countByHilo.get(m.hilo_id) ?? 0) + 1);
    const current = ultimaByHilo.get(m.hilo_id);
    if (!current || m.created_at > current) ultimaByHilo.set(m.hilo_id, m.created_at);
  }

  return hilos.map((h) => ({
    id: h.id,
    grupoId: h.grupo_id,
    materiaId: h.materia_id,
    autorId: h.autor_id,
    autorNombre: h.autor_id ? (autorNombreById.get(h.autor_id) ?? "Usuario") : "Usuario",
    titulo: h.titulo,
    mensajesCount: countByHilo.get(h.id) ?? 0,
    createdAt: h.created_at,
    ultimaActividad: ultimaByHilo.get(h.id) ?? h.created_at,
  }));
}

/** Mensajes de un hilo, en orden, con el nombre del autor resuelto. */
export async function getMensajesParaHilo(
  client: SupabaseClient<Database>,
  hiloId: string
): Promise<ForoMensajeRow[]> {
  const { data: mensajes, error } = await client
    .from("foro_mensajes")
    .select("*")
    .eq("hilo_id", hiloId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Failed to load foro_mensajes:", error);
    return [];
  }
  if (!mensajes || mensajes.length === 0) return [];

  const autorIds = Array.from(new Set(mensajes.map((m) => m.autor_id).filter((id): id is string => Boolean(id))));
  const { data: autores } =
    autorIds.length > 0
      ? await client.from("profiles").select("id, nombre").in("id", autorIds)
      : { data: [] as { id: string; nombre: string }[] };
  const autorNombreById = new Map((autores ?? []).map((a) => [a.id, a.nombre]));

  return mensajes.map((m) => ({
    id: m.id,
    hiloId: m.hilo_id,
    autorId: m.autor_id,
    autorNombre: m.autor_id ? (autorNombreById.get(m.autor_id) ?? "Usuario") : "Usuario",
    mensaje: m.mensaje,
    createdAt: m.created_at,
  }));
}
