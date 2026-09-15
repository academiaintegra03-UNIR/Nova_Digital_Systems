import "server-only";
import { nivelParaPuntaje, type BancoId, type Opcion, type Perfil, type PreguntaDiagnostico } from "@/lib/diagnostico/types";

export interface DesgloseMateria {
  materia: string;
  total: number;
  aciertos: number;
  porcentaje: number;
  nivel: string;
}

export interface ResultadoDiagnostico {
  aciertos: number;
  totalPreguntas: number;
  puntajeGlobal: number;
  nivelGlobal: string;
  enfoqueScore: number;
  desenfoquesCount: number;
  copyPasteCount: number;
  tiempoTotalMinutos: number;
  desgloseMaterias: DesgloseMateria[];
  /** null si el banco no trae datos de perfil (9°/10°) — nunca se
   * inventa un perfil sin esa información. */
  perfilDominante: Perfil | null;
}

/** El banco general usa materias descriptivas ("Matemáticas (Gobernanza
 * y Estructuras Sociales)") — se agrupa por el nombre base para que el
 * desglose sea legible; en 9°/10° (materias ya limpias) esto no cambia
 * nada. */
function materiaBase(materia: string): string {
  return materia.split(" (")[0].trim();
}

export function calcularResultado(
  banco: PreguntaDiagnostico[],
  bancoId: BancoId,
  respuestas: Record<string, Opcion>,
  desenfoquesCount: number,
  copyPasteCount: number,
  tiempoTotalMinutos: number
): ResultadoDiagnostico {
  let aciertos = 0;
  const porMateria = new Map<string, { materia: string; total: number; aciertos: number }>();
  const perfilConteo: Partial<Record<Perfil, number>> = {};

  for (const pregunta of banco) {
    const materia = materiaBase(pregunta.materia);
    const actual = porMateria.get(materia) ?? { materia, total: 0, aciertos: 0 };
    actual.total += 1;

    const respuestaDada = respuestas[pregunta.id];
    if (respuestaDada === pregunta.claveCorrecta) {
      aciertos += 1;
      actual.aciertos += 1;
    }

    if (respuestaDada && pregunta.perfilPorOpcion?.[respuestaDada]) {
      const perfil = pregunta.perfilPorOpcion[respuestaDada]!;
      perfilConteo[perfil] = (perfilConteo[perfil] ?? 0) + 1;
    }

    porMateria.set(materia, actual);
  }

  const totalPreguntas = banco.length;
  const puntajeGlobal = totalPreguntas > 0 ? Math.round((aciertos / totalPreguntas) * 100) : 0;
  // Especificación de Jimmy Ramírez (2026-09-04): 100% base, -5% por cada
  // pérdida de foco (cambio de pestaña) y -10% por cada intento de
  // copiar/cortar/pegar — no es el mismo peso para ambos tipos.
  const enfoqueScore = Math.max(0, 100 - desenfoquesCount * 5 - copyPasteCount * 10);

  const perfilEntries = Object.entries(perfilConteo) as [Perfil, number][];
  const perfilDominante =
    perfilEntries.length > 0 ? perfilEntries.reduce((a, b) => (b[1] > a[1] ? b : a))[0] : null;

  const desgloseMaterias: DesgloseMateria[] = Array.from(porMateria.values()).map((m) => {
    const porcentaje = m.total > 0 ? Math.round((m.aciertos / m.total) * 100) : 0;
    return { ...m, porcentaje, nivel: nivelParaPuntaje(porcentaje, bancoId) };
  });

  return {
    aciertos,
    totalPreguntas,
    puntajeGlobal,
    nivelGlobal: nivelParaPuntaje(puntajeGlobal, bancoId),
    enfoqueScore,
    desenfoquesCount,
    copyPasteCount,
    tiempoTotalMinutos,
    desgloseMaterias,
    perfilDominante,
  };
}
