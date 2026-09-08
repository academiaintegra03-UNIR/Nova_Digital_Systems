import { Award, BarChart3, Bot, BookOpen, CalendarClock, ClipboardCheck, ClipboardList, Compass, HelpCircle, Home, Layers, Users } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";

const navItems: DashboardNavItem[] = [
  { href: "/campus", label: "Inicio", icon: <Home /> },
  { href: "/campus/mi-grupo", label: "Mi grupo", icon: <Users /> },
  { href: "/campus/mis-materias", label: "Mis materias", icon: <Layers /> },
  { href: "/campus/mis-clases", label: "Mis clases", icon: <CalendarClock /> },
  { href: "/campus/diagnostico", label: "Diagnóstico", icon: <ClipboardCheck /> },
  { href: "/campus/mis-resultados", label: "Mis resultados", icon: <Award /> },
  { href: "/campus/mi-ruta", label: "Mi ruta", icon: <Compass /> },
  { href: "/campus/cursos", label: "Mis cursos", icon: <BookOpen /> },
  { href: "/campus/banco-preguntas", label: "Banco de preguntas", icon: <HelpCircle /> },
  { href: "/campus/simulacros", label: "Simulacros", icon: <ClipboardList /> },
  { href: "/campus/progreso", label: "Progreso", icon: <BarChart3 /> },
  { href: "/campus/tutor-ia", label: "Tutor con IA", icon: <Bot /> },
];

export default async function CampusLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("estudiante");

  return (
    <DashboardShell
      panelLabel="Campus"
      navItems={navItems}
      pageSubtitle="Tu campus"
      profile={profile}
    >
      {children}
    </DashboardShell>
  );
}
