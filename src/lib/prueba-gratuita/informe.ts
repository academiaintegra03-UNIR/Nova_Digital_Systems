import "server-only";
import { nivelParaPuntaje } from "@/lib/diagnostico/types";
import { calcularInforme, resumirIncidencias, type EstadoPrueba, type ResultadoMateria } from "@/lib/prueba-gratuita/estado";
import { MATERIA_LABEL } from "@/lib/prueba-gratuita/types";
import type { InformePruebaData } from "@/lib/prueba-gratuita/informe-pdf";

/** Misma escala curricular ICFES de los cursos por grado (Avanzado /
 * Satisfactorio / Mínimo / Inicial). */
export function nivelPrueba(porcentaje: number): string {
  return nivelParaPuntaje(porcentaje, "noveno");
}

/** Saca la sección "Plan de Accion: …" del comentario de un distractor. */
function planDeAccion(comentario: string): string | null {
  const seccion = comentario.split(" | ").find((s) => s.startsWith("Plan de Accion:"));
  return seccion ? seccion.slice("Plan de Accion:".length).trim() : null;
}

export interface InformePrueba {
  data: InformePruebaData;
  resultados: ResultadoMateria[];
}

/** Todo lo que muestran la página del informe, el PDF y el correo, a
 * partir de lo guardado en `pruebas_gratuitas` (respuestas + bitácora). */
export function construirInforme(estudianteNombre: string, estado: EstadoPrueba): InformePrueba {
  const resultados = calcularInforme(estado.respuestas);
  const correctas = resultados.reduce((acc, m) => acc + m.correctas, 0);
  const total = resultados.reduce((acc, m) => acc + m.total, 0);
  const porcentajeGlobal = total ? Math.round((correctas / total) * 100) : 0;

  const competencias = resultados.flatMap((m) =>
    m.porCompetencia.map((c) => ({
      etiqueta: `${MATERIA_LABEL[m.materia]}: ${c.competencia.replace(/\.$/, "")} (${c.correctas} de ${c.total})`,
      porcentaje: c.total ? c.correctas / c.total : 0,
    }))
  );

  return {
    resultados,
    data: {
      estudianteNombre,
      fecha: estado.finalizadaEn,
      porcentajeGlobal,
      nivelGlobal: nivelPrueba(porcentajeGlobal),
      correctas,
      total,
      materias: resultados.map((m) => ({
        materia: MATERIA_LABEL[m.materia],
        correctas: m.correctas,
        total: m.total,
        porcentaje: m.porcentaje,
        nivel: nivelPrueba(m.porcentaje),
        competencias: m.porCompetencia,
      })),
      fortalezas: competencias
        .filter((c) => c.porcentaje >= 0.7)
        .sort((a, b) => b.porcentaje - a.porcentaje)
        .slice(0, 5)
        .map((c) => c.etiqueta),
      aReforzar: competencias
        .filter((c) => c.porcentaje < 0.5)
        .sort((a, b) => a.porcentaje - b.porcentaje)
        .slice(0, 5)
        .map((c) => c.etiqueta),
      incidencias: resumirIncidencias(estado.incidencias),
      preguntas: resultados.flatMap((m) =>
        m.items.map(({ item, elegida, correcta }, i) => ({
          materia: MATERIA_LABEL[m.materia],
          numero: i + 1,
          tarea: item.tarea,
          correcta,
          elegida,
          clave: item.clave,
          planDeAccion: !correcta && elegida ? planDeAccion(item.comentarios[elegida].estudiante) : null,
        }))
      ),
    },
  };
}
