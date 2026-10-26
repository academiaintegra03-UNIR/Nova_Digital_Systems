/** Las 5 materias de la prueba gratuita (Saber 11). El orden en que se
 * presentan es el de `BANCOS` en banco.ts. */
export type MateriaPrueba = "matematicas" | "lectura-critica" | "sociales" | "ciencias" | "ingles";

export const MATERIA_LABEL: Record<MateriaPrueba, string> = {
  matematicas: "Matemáticas",
  "lectura-critica": "Lectura Crítica",
  sociales: "Sociales y Ciudadanas",
  ciencias: "Ciencias Naturales",
  ingles: "Inglés",
};

export type Opcion = "A" | "B" | "C" | "D";

interface NivelJustificado {
  nivel: string;
  justificacion: string;
}

/** Forma de cada reactivo tal como viene del "Banco de Ítems - Saber 11"
 * (Excel → JSON). Además de la pregunta, cada ítem trae su metadata
 * curricular (EBC, competencia, taxonomías Bloom/Marzano/TAED) y dos
 * retroalimentaciones por opción: una para el estudiante ("Trampa | Como
 * caiste | ...") y otra para el docente ("Tipologia | Intencion del error
 * | ..."), ambas como texto plano separado por " | ". */
export interface ItemPrueba {
  id: string;
  materia: string;
  unidad: string;
  momento: number;
  ebc: string;
  competencia: string;
  componente: string;
  afirmacion: string;
  evidencia: string;
  tarea: string;
  bloom: NivelJustificado;
  marzano: NivelJustificado;
  taed: NivelJustificado;
  descriptor: string;
  complejidad: NivelJustificado;
  imagenUrl?: string;
  /** Situación/contexto del problema (va antes de la imagen). */
  contexto: string;
  /** La pregunta en sí. */
  enunciado: string;
  opciones: Record<Opcion, string>;
  clave: Opcion;
  comentarios: Record<Opcion, { estudiante: string; pedagogico: string }>;
}

/** Lo que viaja al navegador mientras se presenta la prueba — sin clave
 * ni retroalimentación, para que la respuesta no se pueda leer desde
 * devtools/Network. */
export type ItemPruebaPublico = Pick<
  ItemPrueba,
  "id" | "materia" | "componente" | "imagenUrl" | "contexto" | "enunciado" | "opciones"
>;

export function toItemPublico(item: ItemPrueba): ItemPruebaPublico {
  return {
    id: item.id,
    materia: item.materia,
    componente: item.componente,
    imagenUrl: item.imagenUrl,
    contexto: item.contexto,
    enunciado: item.enunciado,
    opciones: item.opciones,
  };
}
