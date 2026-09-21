import {
  Brain,
  Divide,
  Globe,
  GraduationCap,
  Landmark,
  Laptop,
  NotebookPen,
  Ruler,
  Sigma,
  Sparkles,
  Target,
  Users,
  BarChart3,
} from "lucide-react";
import type { DiagnosticStep, HeroContent, MethodologyPoint, NeedCard, TrustItem } from "@/lib/types/content";

export const siteName = "Nova Digital Studio Systems";
export const siteTagline = "Comprende, practica y avanza";

// Static hero copy — ported from reference/prototipos/Academia Integra.dc.html
// (formerly a 3-slide auto-rotating carousel; consolidated into one static
// hero per the "no carruseles automáticos" design requirement).
export const heroContent: HeroContent = {
  eyebrow: "Diagnóstico gratuito",
  title: "Aprende matemáticas y prepárate para tus próximos retos académicos.",
  subtitle:
    "Identifica tus fortalezas, mejora paso a paso y estudia con una ruta diseñada según tu nivel y tus objetivos.",
};

export const trustItems: TrustItem[] = [
  { icon: Laptop, label: "Clases virtuales y presenciales" },
  { icon: Target, label: "Programas personalizados" },
  { icon: NotebookPen, label: "Preparación para pruebas nacionales e internacionales" },
  { icon: Users, label: "Seguimiento para estudiantes y familias" },
];

export const needCards: NeedCard[] = [
  { icon: Divide, title: "Matemáticas para primaria", desc: "Fundamentos y confianza desde los primeros grados.", programId: "primaria-fundamentos" },
  { icon: Ruler, title: "Matemáticas para bachillerato", desc: "Álgebra, geometría, trigonometría y estadística.", programId: "bachillerato-algebra" },
  { icon: GraduationCap, title: "Saber 11", desc: "Preparación para el examen ICFES.", programId: "saber11" },
  { icon: Landmark, title: "Admisión universitaria", desc: "Universidad Nacional y otras universidades.", programId: "admision-unal" },
  { icon: Sigma, title: "Matemáticas universitarias", desc: "Precálculo, cálculo diferencial e integral.", programId: "precalculo" },
  { icon: Globe, title: "Preparación internacional", desc: "PAES, EXANI-II y PAA.", programId: "internacional" },
];

export const diagnosticSteps: DiagnosticStep[] = [
  { n: 1, label: "Realiza el diagnóstico" },
  { n: 2, label: "Recibe una ruta de aprendizaje" },
  { n: 3, label: "Aprende y practica" },
  { n: 4, label: "Consulta tu progreso" },
];

export const methodologyPoints: MethodologyPoint[] = [
  { icon: Brain, title: "Razonamiento, no memorización", desc: "Trabajamos el porqué de cada concepto." },
  { icon: Users, title: "Grupos reducidos", desc: "Atención real a cada estudiante." },
  { icon: BarChart3, title: "Seguimiento continuo", desc: "Reportes claros para el estudiante y su familia." },
  { icon: Sparkles, title: "IA como apoyo, no reemplazo", desc: "El tutor humano sigue siendo el centro." },
];

export const studentBenefits: string[] = [
  "Ruta de aprendizaje según tu nivel",
  "Práctica ilimitada en el banco de preguntas",
  "Simulacros con retroalimentación",
  "Tutor con IA disponible cuando lo necesites",
];

export const parentBenefits: string[] = [
  "Reportes de progreso periódicos",
  "Comunicación directa con el tutor",
  "Visibilidad de asistencia y avance",
  "Facturación y pagos centralizados",
];

export const schoolServices: string[] = [
  "Resultados agregados por curso y grupo",
  "Programación de simulacros institucionales",
  "Comunicación directa con coordinadores",
  "Exportación de informes",
];

export const aiResponsibleUseNote =
  "El tutor con IA acompaña el razonamiento del estudiante: da pistas, hace preguntas y explica paso a paso — nunca entrega la respuesta de inmediato ni sustituye al tutor humano. Puede cometer errores y siempre puede derivarte con tu tutor asignado. No garantizamos puntajes ni admisiones.";
