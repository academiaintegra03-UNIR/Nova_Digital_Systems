import { Users, School } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BrochurePrecios {
  titulo: string;
  cupo: string;
  descripcion: string;
  icon: LucideIcon;
  /** Página con los precios dentro de este sitio. */
  href: string;
}

/** Precios del preicfes de grado 11 para 2027. No viven en la tabla `plans`:
 * al cambiar de año o de grado basta con actualizar estos enlaces. */
export const preicfes2027: { grado: number; anio: number; brochures: BrochurePrecios[] } = {
  grado: 11,
  anio: 2027,
  brochures: [
    {
      titulo: "Grupo reducido",
      cupo: "Máximo 3 estudiantes",
      descripcion: "Acompañamiento cercano para un estudiante, hermanos o un grupo pequeño de amigos.",
      icon: Users,
      href: "/planes-precios/grupo-reducido",
    },
    {
      titulo: "Grupos y colegios",
      cupo: "De 4 a 10 estudiantes",
      descripcion: "Para colegios, cursos o grupos que se preparan juntos para el Saber 11.",
      icon: School,
      href: "/planes-precios/grupos-y-colegios",
    },
  ],
};
