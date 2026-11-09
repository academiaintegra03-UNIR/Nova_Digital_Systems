import { PRUEBA_GRATUITA_POPUP_HREF } from "@/lib/data/nav";

export type CategoriaNoticia = "Simulacro gratuito" | "Resultados" | "Matrículas" | "Colegios";

export interface Noticia {
  id: string;
  categoria: CategoriaNoticia;
  /** Fecha legible, p. ej. "Noviembre 2026". */
  fecha: string;
  titulo: string;
  resumen: string;
  /** Foto de fondo de su diapositiva, dentro de public/. Sin foto queda el
   * fondo oscuro de la página. */
  imagen?: string;
  cta: { label: string; href: string };
}

/**
 * Noticias del carrusel del hero de la portada, después de la presentación
 * y en el orden en que se muestran. Para publicar una nueva basta con
 * agregarla aquí. Los resultados de colegios solo se publican con datos reales y autorizados por el colegio.
 */
export const noticias: Noticia[] = [
  {
    id: "simulacro-gratuito-saber-11",
    categoria: "Simulacro gratuito",
    fecha: "Noviembre 2026",
    titulo: "Ya está abierto el simulacro gratuito Saber 11 — 5 materias",
    resumen:
      "Lectura crítica, matemáticas, sociales y ciudadanas, ciencias naturales e inglés, con cronómetro por materia e informe de resultados al terminar.",
    imagen: "/images/student-laptop-classroom.jpg",
    cta: { label: "Presentar el simulacro", href: PRUEBA_GRATUITA_POPUP_HREF },
  },
  {
    id: "alianza-colegios-2027",
    categoria: "Colegios",
    fecha: "Calendario A 2027",
    titulo: "Alianza para colegios: grupos de 4 a 10 estudiantes",
    resumen:
      "Preparación Saber 11 para cursos y delegaciones, con simulacros cronometrados de 4,5 horas y reportes de avance para el colegio y las familias.",
    imagen: "/images/group-study.jpg",
    cta: { label: "Ver grupos y colegios", href: "/alianza-colegios" },
  },
];
