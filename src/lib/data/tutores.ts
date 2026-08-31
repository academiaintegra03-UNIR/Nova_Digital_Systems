// Ported verbatim from reference/prototipos/Panel Tutores.dc.html (mock/demo data).
import type { AssignedStudent, GeneratedReport, GradingItem, InboxMessage } from "@/lib/types/panels";

export const assignedStudents: AssignedStudent[] = [
  { name: "Mariana Gómez", group: "11°A", due: "Taller factorización", alert: "Ninguna", tone: "success" },
  { name: "Juan Pablo Rincón", group: "11°B", due: "Quiz de ángulos", alert: "Bajo avance", tone: "error" },
  { name: "Sara Valentina Cruz", group: "10°A", due: "Guía de fracciones", alert: "Inasistencia", tone: "error" },
  { name: "Camilo Andrés Pardo", group: "11°A", due: "Simulacro corto", alert: "Ninguna", tone: "success" },
  { name: "Daniela Fernanda Ríos", group: "10°B", due: "Taller de proporciones", alert: "Ninguna", tone: "success" },
];

export const pendingGrading: GradingItem[] = [
  { title: "Quiz de ángulos", student: "Juan Pablo Rincón", course: "Geometría" },
  { title: "Taller de factorización", student: "Mariana Gómez", course: "Álgebra básica" },
  { title: "Guía de fracciones", student: "Sara Valentina Cruz", course: "Fundamentos" },
  { title: "Simulacro corto", student: "Camilo Andrés Pardo", course: "Saber 11" },
];

export const messages: InboxMessage[] = [
  { from: "Luisa Gómez (acudiente)", date: "hace 2 horas", text: "¿Cómo le fue a Mariana en el último quiz?" },
  { from: "Coordinación — Colegio San Rafael", date: "hace 1 día", text: "Confirmar horario del simulacro institucional de agosto." },
];

export const generatedReports: GeneratedReport[] = [
  { title: "Reporte quincenal — Mariana Gómez", date: "16 ago 2026" },
  { title: "Reporte de grupo — 11°B", date: "1 ago 2026" },
  { title: "Reporte de simulacro — 11°A", date: "20 jul 2026" },
];
