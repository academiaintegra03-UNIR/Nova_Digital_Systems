import "server-only";
import { createHash } from "node:crypto";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveSubscription } from "@/lib/queries/subscription";
import { getBancoPrueba, getMateriasDisponibles } from "@/lib/prueba-gratuita/banco";
import type { ItemPrueba, MateriaPrueba, Opcion } from "@/lib/prueba-gratuita/types";
import type { Profile } from "@/lib/types/session";
import type { Incidencia } from "@/lib/diagnostico/types";

/** Opción elegida por ítem, agrupada por materia — forma de la columna
 * `pruebas_gratuitas.respuestas` (ver 0025_pruebas_gratuitas.sql). */
export type RespuestasPrueba = Partial<Record<MateriaPrueba, Record<string, Opcion>>>;

/** Segundos activos en cada ítem, agrupados por materia — forma de la
 * columna `pruebas_gratuitas.tiempos` (ver 0028_pruebas_gratuitas_tiempos.sql). */
export type TiemposPrueba = Partial<Record<MateriaPrueba, Record<string, number>>>;

/** Misma bitácora forense del diagnóstico, más la materia en curso. */
export interface IncidenciaPrueba extends Incidencia {
  materia: MateriaPrueba;
}

export interface EstadoPrueba {
  respuestas: RespuestasPrueba;
  incidencias: IncidenciaPrueba[];
  tiempos: TiemposPrueba;
  finalizada: boolean;
  finalizadaEn: string | null;
}

/**
 * true para un estudiante cuya cuenta se creó desde /admin/postulantes
 * (postulación con su `profile_id`) y que todavía no tiene matrícula.
 * Esa cuenta solo sirve para la prueba gratuita: mientras la presenta no
 * entra al campus, y al terminarla su panel solo muestra el informe
 * (ver campus/layout.tsx). Si paga un plan individual, deja de
 * ser cuenta de prueba y entra al campus normal.
 *
 * Un postulante cuyo correo ya tenía cuenta (profile_id null en la
 * postulación) no queda restringido — ya era usuario antes.
 */
export const esCuentaPruebaGratuita = cache(async (profile: Profile): Promise<boolean> => {
  if (profile.role !== "estudiante") return false;

  const admin = createAdminClient();
  const { data: postulacion } = await admin
    .from("postulaciones_prueba_gratuita")
    .select("id")
    .eq("profile_id", profile.id)
    .limit(1)
    .maybeSingle();
  if (!postulacion) return false;

  const suscripcion = await getActiveSubscription(profile.id, "individual");
  return !suscripcion;
});

export async function getEstadoPrueba(profileId: string): Promise<EstadoPrueba> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("pruebas_gratuitas")
    .select("respuestas, incidencias, tiempos, finalizada_en")
    .eq("profile_id", profileId)
    .maybeSingle();

  return {
    respuestas: (data?.respuestas ?? {}) as RespuestasPrueba,
    incidencias: (data?.incidencias ?? []) as unknown as IncidenciaPrueba[],
    tiempos: (data?.tiempos ?? {}) as TiemposPrueba,
    finalizada: Boolean(data?.finalizada_en),
    finalizadaEn: data?.finalizada_en ?? null,
  };
}

export interface ResumenIncidencias {
  pestana: number;
  copiaPegado: number;
  /** Las caídas de internet no cuentan como falta de integridad: se
   * informan aparte, para dar contexto a tiempos largos o reintentos. */
  caidasConexion: number;
  segundosSinConexion: number;
}

const TIPOS_COPIA_PEGADO = new Set<Incidencia["tipo"]>(["intento_copia", "intento_corte", "intento_pegado"]);

/** Salidas de pestaña, copiar/cortar/pegar y caídas de conexión, cada una
 * por separado — el diagnóstico también las cuenta aparte (pesan distinto). */
export function resumirIncidencias(incidencias: Incidencia[]): ResumenIncidencias {
  const caidas = incidencias.filter((i) => i.tipo === "conexion_perdida");
  return {
    pestana: incidencias.filter((i) => i.tipo === "pestaña_abandonada").length,
    copiaPegado: incidencias.filter((i) => TIPOS_COPIA_PEGADO.has(i.tipo)).length,
    caidasConexion: caidas.length,
    segundosSinConexion: caidas.reduce((acc, i) => acc + (i.duracionSegundos ?? 0), 0),
  };
}

/**
 * Orden aleatorio de las materias, distinto para cada estudiante pero
 * fijo para el mismo estudiante: se baraja (Fisher–Yates) con una semilla
 * derivada de su id. Así no todos empiezan por la misma materia, y el
 * orden no cambia al recargar ni hay que guardarlo en la base.
 */
export function ordenMaterias(profileId: string): MateriaPrueba[] {
  const hash = createHash("sha256").update(`prueba-gratuita:${profileId}`).digest();
  const materias = [...getMateriasDisponibles()];
  for (let i = materias.length - 1; i > 0; i--) {
    const j = hash.readUInt32BE((i * 4) % (hash.length - 3)) % (i + 1);
    [materias[i], materias[j]] = [materias[j], materias[i]];
  }
  return materias;
}

/** Materias que el estudiante todavía no ha enviado, en su orden. */
export function materiasPendientes(profileId: string, respuestas: RespuestasPrueba): MateriaPrueba[] {
  return ordenMaterias(profileId).filter((materia) => !respuestas[materia]);
}

export interface ResultadoItem {
  item: ItemPrueba;
  elegida: Opcion | null;
  correcta: boolean;
  /** null en pruebas presentadas antes de que existiera el cronómetro. */
  segundos: number | null;
}

export interface ResultadoMateria {
  materia: MateriaPrueba;
  correctas: number;
  total: number;
  porcentaje: number;
  /** Suma del tiempo por pregunta; null si no hay tiempos guardados. */
  segundos: number | null;
  porCompetencia: { competencia: string; correctas: number; total: number }[];
  items: ResultadoItem[];
}

/** Califica contra el banco actual — el puntaje no se guarda en la base. */
export function calcularInforme(respuestas: RespuestasPrueba, tiempos: TiemposPrueba = {}): ResultadoMateria[] {
  return (Object.keys(respuestas) as MateriaPrueba[]).map((materia) => {
    const elegidas = respuestas[materia] ?? {};
    const tiemposMateria = tiempos[materia];
    const items = getBancoPrueba(materia).map((item) => {
      const elegida = elegidas[item.id] ?? null;
      const segundos = tiemposMateria?.[item.id];
      return { item, elegida, correcta: elegida === item.clave, segundos: typeof segundos === "number" ? segundos : null };
    });

    const competencias = new Map<string, { correctas: number; total: number }>();
    for (const { item, correcta } of items) {
      const acc = competencias.get(item.competencia) ?? { correctas: 0, total: 0 };
      acc.total += 1;
      if (correcta) acc.correctas += 1;
      competencias.set(item.competencia, acc);
    }

    const correctas = items.filter((r) => r.correcta).length;
    return {
      materia,
      correctas,
      total: items.length,
      porcentaje: items.length ? Math.round((correctas / items.length) * 100) : 0,
      segundos: tiemposMateria ? items.reduce((acc, r) => acc + (r.segundos ?? 0), 0) : null,
      porCompetencia: [...competencias].map(([competencia, acc]) => ({ competencia, ...acc })),
      items,
    };
  });
}
