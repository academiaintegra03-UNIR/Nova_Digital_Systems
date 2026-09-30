export type BancoId = "general" | "noveno" | "decimo";

/** Etiquetas compartidas por el cliente (selector de batería), la ruta
 * de submit (correo/WhatsApp) y el dashboard de admin — un solo lugar
 * para no repetir los mismos 3 nombres en varios archivos. */
export const BANCO_LABEL: Record<BancoId, string> = {
  general: "Batería Diagnóstica General (14 reactivos)",
  noveno: "Curso Pre-ICFES Grado 9° (60 reactivos)",
  decimo: "Curso Pre-ICFES Grado 10° (108 reactivos)",
};

export type Perfil = "Soberano" | "Operario" | "Cínico" | "Seguidor";

/** Escala de nivel por puntaje — especificación de Jimmy Ramírez
 * (2026-09-04): la Batería General usa una escala de "soberanía
 * cognitiva", los cursos por grado (9°/10°) una escala curricular
 * ICFES. Se aplica tanto al puntaje global como al de cada materia. */
const NIVELES_GENERAL: { min: number; label: string }[] = [
  { min: 80, label: "Soberano" },
  { min: 65, label: "Estratégico" },
  { min: 50, label: "Vulnerable" },
  { min: 0, label: "Dependiente" },
];

const NIVELES_CURSO: { min: number; label: string }[] = [
  { min: 80, label: "Avanzado" },
  { min: 65, label: "Satisfactorio" },
  { min: 50, label: "Mínimo" },
  { min: 0, label: "Inicial" },
];

export function nivelParaPuntaje(porcentaje: number, bancoId: BancoId): string {
  const escala = bancoId === "general" ? NIVELES_GENERAL : NIVELES_CURSO;
  return (escala.find((n) => porcentaje >= n.min) ?? escala[escala.length - 1]).label;
}

/** Tipo de incidencia de integridad capturada durante el examen —
 * mismo vocabulario de la "Bitácora Forense" de la especificación. */
export type TipoIncidencia = "pestaña_abandonada" | "intento_copia" | "intento_corte" | "intento_pegado";

export interface Incidencia {
  timestamp: string;
  tipo: TipoIncidencia;
  preguntaId: string | null;
  detalle: string;
}

export type Opcion = "A" | "B" | "C" | "D";

/** Forma interna única a la que se normalizan los 3 bancos (que en los
 * archivos fuente vienen en 2 esquemas distintos) — el resto del sistema
 * (scoring, rutas, frontend) solo conoce esta forma. */
export interface PreguntaDiagnostico {
  id: string;
  materia: string;
  enunciado: string;
  /** Imagen que acompaña la pregunta (gráfico, tabla, diagrama) — algunos
   * reactivos de 9°/10° la traen. Se extrae del `enunciado` fuente (venía
   * como una URL de Cloudinary pegada al inicio del texto) al normalizar
   * el banco, ver `extraerImagenEnunciado` en bancos.ts. */
  imagenUrl?: string;
  opciones: Record<Opcion, string>;
  claveCorrecta: Opcion;
  /** Solo el banco "general" trae perfil por opción — en 9°/10° queda
   * undefined, nunca se inventa. */
  perfilPorOpcion?: Partial<Record<Opcion, Perfil>>;
  requiereJustificacion?: boolean;
}

/** Versión pública de una pregunta — la que viaja al navegador, sin la
 * clave correcta ni los perfiles (evita que se pueda leer la respuesta
 * desde devtools/Network). */
export type PreguntaPublica = Omit<PreguntaDiagnostico, "claveCorrecta" | "perfilPorOpcion">;

export function toPreguntaPublica(p: PreguntaDiagnostico): PreguntaPublica {
  return {
    id: p.id,
    materia: p.materia,
    enunciado: p.enunciado,
    imagenUrl: p.imagenUrl,
    opciones: p.opciones,
    requiereJustificacion: p.requiereJustificacion,
  };
}
