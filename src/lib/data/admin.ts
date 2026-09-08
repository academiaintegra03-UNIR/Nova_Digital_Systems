// Ported verbatim from reference/prototipos/Panel Administrativo.dc.html (mock/demo data).
import type { AdminEnrollmentRow, AdminProgramRow, AdminScheduledReport } from "@/lib/types/panels";

export const programsAdmin: AdminProgramRow[] = [
  { name: "Fundamentos matemáticos", level: "Primaria", seats: "32/40", status: "Publicado", tone: "success" },
  { name: "Álgebra y geometría", level: "Bachillerato", seats: "58/60", status: "Publicado", tone: "success" },
  { name: "Preparación Saber 11", level: "Preparación exámenes", seats: "90/100", status: "Publicado", tone: "success" },
  { name: "Admisión Universidad Nacional", level: "Preparación exámenes", seats: "24/40", status: "Publicado", tone: "success" },
  { name: "Precálculo y cálculo diferencial", level: "Universidad", seats: "12/30", status: "Borrador", tone: "warning" },
  { name: "Preparación PAES / EXANI-II / PAA", level: "Preparación exámenes", seats: "6/40", status: "Borrador", tone: "warning" },
];

export const enrollments: AdminEnrollmentRow[] = [
  { student: "Mariana Gómez", program: "Preparación Saber 11", plan: "Personalizado", status: "Confirmada", tone: "success" },
  { student: "Camilo Andrés Pardo", program: "Preparación Saber 11", plan: "Grupal", status: "Confirmada", tone: "success" },
  { student: "Nuevo estudiante — sin nombre", program: "Álgebra y geometría", plan: "Grupal", status: "Pago pendiente", tone: "warning" },
  { student: "Sara Valentina Cruz", program: "Fundamentos matemáticos", plan: "Personalizado", status: "Confirmada", tone: "success" },
  { student: "Nuevo estudiante — sin nombre", program: "Precálculo", plan: "Grupal", status: "Incompleta", tone: "error" },
];

export const scheduledReports: AdminScheduledReport[] = [
  { title: "Reporte quincenal — Grado 11°", to: "Acudientes 11°", when: "1 sep 2026", status: "Programado", tone: "info" },
  { title: "Reporte mensual — Colegio San Rafael", to: "Coordinación", when: "1 sep 2026", status: "Programado", tone: "info" },
  { title: "Reporte quincenal — Grado 10°", to: "Acudientes 10°", when: "Enviado 16 ago 2026", status: "Entregado", tone: "success" },
  { title: "Reporte de simulacro institucional", to: "Colegio San Rafael", when: "Enviado 19 jul 2026", status: "Fallido", tone: "error" },
];
