import "server-only";
import type { Opcion, Perfil, PreguntaDiagnostico } from "@/lib/diagnostico/types";

export interface DesgloseMateria {
  materia: string;
  total: number;
  aciertos: number;
}

export interface ResultadoDiagnostico {
  aciertos: number;
  totalPreguntas: number;
  puntajeGlobal: number;
  enfoqueScore: number;
  desenfoquesCount: number;
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
  respuestas: Record<string, Opcion>,
  desenfoquesCount: number
): ResultadoDiagnostico {
  let aciertos = 0;
  const porMateria = new Map<string, DesgloseMateria>();
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
  const enfoqueScore = Math.max(0, 100 - desenfoquesCount * 10);

  const perfilEntries = Object.entries(perfilConteo) as [Perfil, number][];
  const perfilDominante =
    perfilEntries.length > 0 ? perfilEntries.reduce((a, b) => (b[1] > a[1] ? b : a))[0] : null;

  return {
    aciertos,
    totalPreguntas,
    puntajeGlobal,
    enfoqueScore,
    desenfoquesCount,
    desgloseMaterias: Array.from(porMateria.values()),
    perfilDominante,
  };
}
