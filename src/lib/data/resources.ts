import { FileText, Video, PencilLine, Timer, Calculator, Sigma } from "lucide-react";
import type { Resource } from "@/lib/types/content";
import { PRUEBA_GRATUITA_POPUP_HREF } from "@/lib/data/nav";

export const resources: Resource[] = [
  {
    id: 1,
    title: "Guía: 5 retos de razonamiento lógico",
    type: "Guía descargable",
    level: "Primaria",
    icon: FileText,
    tag: "Gratis",
    href: "https://docs.google.com/document/d/1ItgqtwCt98eI7av1O-cd54mtDATLwUL6GAtiQNBIzZQ/edit?usp=sharing",
  },
  {
    id: 2,
    title: "Mini-clase: el dilema de la inteligencia artificial",
    type: "Video",
    level: "Todos",
    icon: Video,
    tag: "Gratis",
    href: "https://youtube.com/shorts/yMiNzg6LZvk",
  },
  {
    id: 3,
    title: "Ejercicios de álgebra resueltos",
    type: "Ejercicios",
    level: "Bachillerato",
    icon: PencilLine,
    tag: "Gratis",
    href: "https://sites.google.com/view/elenigmaalgebraicotraductormen/full-page-embed",
  },
  {
    id: 5,
    title: "Calculadora de fracciones paso a paso",
    type: "Calculadora",
    level: "Todos",
    icon: Calculator,
    tag: "Gratis",
    href: "https://sites.google.com/view/laboratorio-cuantico-de-fracci/full-page-embed",
  },
  {
    id: 6,
    title: "Aplicando una fórmula maestra trigonométrica",
    type: "Guía",
    level: "Universidad",
    icon: Sigma,
    tag: "Gratis",
    href: "https://drive.google.com/file/d/1GqGEuz-3aCCe-kWmCwaIlgUvz_hUXuPF/view",
  },
  {
    id: 4,
    title: "Simulacro gratuito Saber 11 — 5 materias",
    type: "Simulacro",
    level: "Preparación exámenes",
    icon: Timer,
    tag: "Gratis",
    href: PRUEBA_GRATUITA_POPUP_HREF,
  },
];
