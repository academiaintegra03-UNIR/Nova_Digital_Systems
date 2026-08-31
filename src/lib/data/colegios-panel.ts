// Ported verbatim from reference/prototipos/Panel Colegios.dc.html (mock/demo data).
import type { ProgressItem, SchoolReport, SchoolSimulation } from "@/lib/types/panels";

export const areaResults: ProgressItem[] = [
  { name: "Razonamiento cuantitativo", pct: 63 },
  { name: "Lectura crítica", pct: 71 },
  { name: "Ciencias naturales", pct: 55 },
  { name: "Ciencias sociales", pct: 68 },
  { name: "Inglés", pct: 74 },
];

export const schoolSims: SchoolSimulation[] = [
  { name: "Simulacro institucional Saber 11 — Agosto", date: "Programado 20 ago 2026", participation: "92%" },
  { name: "Simulacro institucional Saber 11 — Julio", date: "Realizado 18 jul 2026", participation: "87%" },
  { name: "Simulacro corto — Grado 10°", date: "Realizado 5 jul 2026", participation: "81%" },
];

export const schoolReports: SchoolReport[] = [
  { title: "Informe institucional — Julio 2026" },
  { title: "Comparativo de diagnósticos — Grado 10° y 11°" },
  { title: "Participación y asistencia — Semestre 1" },
];
