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

export type Opcion = "A" | "B" | "C" | "D";

/** Forma interna única a la que se normalizan los 3 bancos (que en los
 * archivos fuente vienen en 2 esquemas distintos) — el resto del sistema
 * (scoring, rutas, frontend) solo conoce esta forma. */
export interface PreguntaDiagnostico {
  id: string;
  materia: string;
  enunciado: string;
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
    opciones: p.opciones,
    requiereJustificacion: p.requiereJustificacion,
  };
}
