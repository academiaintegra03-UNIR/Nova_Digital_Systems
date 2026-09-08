import type { LucideIcon } from "lucide-react";
import type { StatusTone } from "@/components/shared/status-badge";
import type { Role } from "@/lib/types/session";
import type { DocumentType, PlanType, PlanBillingType } from "@/lib/supabase/database.types";

export interface Stat {
  label: string;
  value: string;
}

export interface ProgressItem {
  name: string;
  pct: number;
}

export interface WeekBar {
  label: string;
  value: number;
}

export interface ToneLabel {
  label: string;
  tone: StatusTone;
}

// ---- Campus (estudiante) ----
export interface RouteDetailModule {
  name: string;
  lessons: number;
  status: "Completado" | "En curso" | "Pendiente";
}

export interface CourseProgress {
  name: string;
  level: string;
  pct: number;
}

export interface SimAttempt {
  name: string;
  date: string;
  score: string;
  tone: StatusTone;
}

export interface AvailableSim {
  name: string;
  questions: number;
  duration: string;
}

export interface MiGrupoRow {
  id: string;
  name: string;
  tutorNombre: string | null;
  /** Nombres de los demás estudiantes del grupo — no incluye al propio. */
  companeros: string[];
}

// ---- Acudientes ----
export interface StudentReport {
  title: string;
  date: string;
  status: string;
  tone: StatusTone;
}

export interface Invoice {
  desc: string;
  date: string;
  amount: string;
  status: string;
  tone: StatusTone;
}

export interface InboxMessage {
  from: string;
  date: string;
  text: string;
}

// ---- Colegios panel ----
export interface SchoolSimulation {
  name: string;
  date: string;
  participation: string;
}

export interface SchoolReport {
  title: string;
}

// ---- Tutores ----
export interface AssignedStudent {
  name: string;
  group: string;
  due: string;
  alert: string;
  tone: StatusTone;
}

export interface GradingItem {
  title: string;
  student: string;
  course: string;
}

export interface GeneratedReport {
  title: string;
  date: string;
}

// ---- Admin ----
export interface AdminAlert {
  icon: LucideIcon;
  text: string;
  tone: StatusTone;
}

export interface Colegio {
  id: string;
  nombre: string;
}

export interface EstudianteOption {
  id: string;
  nombre: string;
}

export interface TutorOption {
  id: string;
  nombre: string;
}

export interface AdminGrupoRow {
  id: string;
  name: string;
  colegioId: string | null;
  colegioNombre: string | null;
  tutorId: string | null;
  tutorNombre: string | null;
  esDefaultColegio: boolean;
  studentIds: string[];
}

/** Estudiante con su colegio y documento, para buscar/agrupar en admin/grupos. */
export interface GrupoEstudianteOption extends EstudianteOption {
  colegioId: string | null;
  colegioNombre: string | null;
  numeroDocumento: string | null;
}

export interface Materia {
  id: string;
  name: string;
}

/** Clase programada, con los nombres ya resueltos — mismo shape para las
 * vistas de admin, tutor y estudiante. */
export interface ClaseRow {
  id: string;
  grupoId: string;
  grupoNombre: string;
  materiaId: string;
  materiaNombre: string;
  tutorId: string | null;
  tutorNombre: string | null;
  nombre: string;
  scheduledAt: string;
  durationMinutes: number | null;
  meetingLink: string | null;
  recordingLink: string | null;
}

/** Vínculo grupo↔materia ("este grupo tiene esta materia"), nombres ya
 * resueltos — mismo shape para las vistas de tutor y estudiante. */
export interface GrupoMateriaRow {
  id: string;
  grupoId: string;
  grupoNombre: string;
  materiaId: string;
  materiaNombre: string;
}

export type ActividadEstado = "pendiente" | "entregada";

export interface ActividadRow {
  id: string;
  grupoId: string;
  materiaId: string;
  tutorId: string | null;
  titulo: string;
  descripcion: string | null;
  fechaLimite: string | null;
  recursoLink: string | null;
  createdAt: string;
}

/** La entrega del propio estudiante para una actividad — null si todavía
 * no existe la fila (equivale a "pendiente"). */
export interface ActividadEntregaEstudiante {
  actividadId: string;
  estado: ActividadEstado;
  entregadoAt: string | null;
  respuestaLink: string | null;
}

/** Fila del roster que ve el tutor: un estudiante del grupo + su estado
 * de entrega para una actividad puntual. */
export interface ActividadEntregaRoster {
  studentId: string;
  studentNombre: string;
  estado: ActividadEstado;
  entregadoAt: string | null;
  respuestaLink: string | null;
}

export interface ForoHiloRow {
  id: string;
  grupoId: string;
  materiaId: string;
  autorId: string | null;
  autorNombre: string;
  titulo: string;
  mensajesCount: number;
  createdAt: string;
  ultimaActividad: string;
}

export interface ForoMensajeRow {
  id: string;
  hiloId: string;
  autorId: string | null;
  autorNombre: string;
  mensaje: string;
  createdAt: string;
}

export interface RecursoRow {
  id: string;
  grupoId: string;
  materiaId: string;
  titulo: string;
  tipo: "pdf" | "link";
  url: string;
  createdAt: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  roleTone: StatusTone;
  /** Only meaningful when role === "estudiante". null = independiente. */
  colegioId: string | null;
  colegioNombre: string | null;
  /** Only meaningful when role === "acudiente". */
  linkedStudentIds: string[];
  telefono: string | null;
  tipoDocumento: DocumentType | null;
  numeroDocumento: string | null;
  /** Solo si tiene una suscripción activa cuyo tipo de plan coincide con
   * su rol (individual/estudiante, grupal/acudiente, institucional/colegio). */
  subscription: {
    id: string;
    planName: string;
    planSeatLimit: number | null;
    seatLimitOverride: number | null;
    billingType: PlanBillingType;
    expiresAt: string | null;
  } | null;
}

/** Plan activo, para el selector de "Activar suscripción". */
export interface PlanOption {
  id: string;
  name: string;
  type: PlanType;
  seatLimit: number | null;
  billingType: PlanBillingType;
  durationDays: number | null;
}

export interface AdminProgramRow {
  name: string;
  level: string;
  seats: string;
  status: string;
  tone: StatusTone;
}

export interface AdminEnrollmentRow {
  student: string;
  program: string;
  plan: string;
  status: string;
  tone: StatusTone;
}

export interface AdminPaymentRow {
  desc: string;
  amount: string;
  method: string;
  status: string;
  tone: StatusTone;
}

export interface AdminScheduledReport {
  title: string;
  to: string;
  when: string;
  status: string;
  tone: StatusTone;
}
