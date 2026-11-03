import { Users, School } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BrochurePrecios {
  titulo: string;
  cupo: string;
  descripcion: string;
  icon: LucideIcon;
  /** Brochure con precios, publicado fuera de este sitio. */
  href: string;
}

/** Precios del preicfes de grado 11 para 2027. Viven en los brochures de
 * inteligencia-educativa-ndss.web.app, no en la tabla `plans`: al cambiar
 * de año o de grado basta con actualizar estos enlaces. */
export const preicfes2027: { grado: number; anio: number; brochures: BrochurePrecios[] } = {
  grado: 11,
  anio: 2027,
  brochures: [
    {
      titulo: "Grupo reducido",
      cupo: "Máximo 3 estudiantes",
      descripcion: "Acompañamiento cercano para un estudiante, hermanos o un grupo pequeño de amigos.",
      icon: Users,
      href: "https://inteligencia-educativa-ndss.web.app/brochure.html?grado=11",
    },
    {
      titulo: "Grupos y colegios",
      cupo: "De 4 a 10 estudiantes",
      descripcion: "Para colegios, cursos o grupos que se preparan juntos para el Saber 11.",
      icon: School,
      href: "https://inteligencia-educativa-ndss.web.app/colegios?grado=11",
    },
  ],
};
