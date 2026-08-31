// Ported verbatim from reference/prototipos/Campus Estudiante.dc.html (mock/demo data).
import type { AvailableSim, CourseProgress, ProgressItem, RouteDetailModule, SimAttempt } from "@/lib/types/panels";

export const routeDetail: RouteDetailModule[] = [
  { name: "Álgebra básica", lessons: 12, status: "Completado" },
  { name: "Geometría", lessons: 10, status: "En curso" },
  { name: "Trigonometría", lessons: 9, status: "En curso" },
  { name: "Estadística", lessons: 8, status: "Pendiente" },
  { name: "Preparación Saber 11", lessons: 14, status: "Pendiente" },
];

export const courses: CourseProgress[] = [
  { name: "Álgebra básica", level: "Bachillerato", pct: 100 },
  { name: "Geometría", level: "Bachillerato", pct: 72 },
  { name: "Trigonometría", level: "Bachillerato", pct: 40 },
  { name: "Preparación Saber 11", level: "Preparación de exámenes", pct: 25 },
];

export const bankFilters = ["Álgebra", "Geometría", "Trigonometría", "Nivel: Intermedio", "Saber 11"];
export const sampleQuestion = {
  prompt: "Si 3x − 5 = 16, ¿cuál es el valor de x?",
  meta: "Pregunta 8 de práctica ilimitada · Álgebra",
  options: ["A) x = 5", "B) x = 7", "C) x = 11", "D) x = 21"],
};
export const bankStats = { attempts: 47, accuracy: "78%", weakestTopic: "Factorización" };

export const availableSims: AvailableSim[] = [
  { name: "Simulacro Saber 11 completo", questions: 60, duration: "3 horas" },
  { name: "Simulacro por área: Matemáticas", questions: 20, duration: "45 min" },
  { name: "Simulacro corto de práctica", questions: 10, duration: "20 min" },
];

export const pastSims: SimAttempt[] = [
  { name: "Simulacro corto de práctica", date: "3 ago 2026", score: "82%", tone: "success" },
  { name: "Simulacro por área: Matemáticas", date: "27 jul 2026", score: "68%", tone: "warning" },
  { name: "Simulacro Saber 11 completo", date: "15 jul 2026", score: "71%", tone: "info" },
];

export const areaPerformance: ProgressItem[] = [
  { name: "Razonamiento cuantitativo", pct: 78 },
  { name: "Lectura crítica", pct: 65 },
  { name: "Ciencias naturales", pct: 58 },
  { name: "Ciencias sociales", pct: 71 },
  { name: "Inglés", pct: 84 },
];

export const studyHours = [3, 5, 4, 6, 2, 5].map((h, i) => ({ label: `S${i + 1}`, value: h }));

export const tutorIaChat = [
  {
    role: "ai" as const,
    text: "¡Hola! Soy tu tutor con IA. Vi que tuviste algo de dificultad con factorización. ¿Quieres una pista para el último ejercicio?",
  },
  { role: "user" as const, text: "Sí, dame una pista" },
  {
    role: "ai" as const,
    text: "Busca dos números que multiplicados den el término independiente y sumados den el coeficiente del término medio. ¿Puedes intentarlo con esa idea?",
  },
];
export const tutorIaWarning = "El tutor con IA puede cometer errores. Si tienes dudas, consulta con tu tutor humano.";
export const tutorButtons = ["Dame una pista", "Explícamelo de otra forma", "Muéstrame un ejemplo", "Consultar con mi tutor"];
