import { Award, BarChart3, Bot, BookOpen, CalendarClock, ClipboardCheck, ClipboardList, Compass, FileText, HelpCircle, Home, Layers, Sparkles, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { esCuentaPruebaGratuita, getEstadoPrueba } from "@/lib/prueba-gratuita/estado";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { MiInformeContenido } from "@/features/prueba-gratuita/mi-informe-contenido";

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

/** Panel de una cuenta de prueba gratuita que ya la terminó: solo su
 * informe — el resto del campus requiere un plan. */
const navItemsPrueba: DashboardNavItem[] = [
  { href: "/campus/mi-informe", label: "Mi informe", icon: <FileText /> },
  { href: "/planes-precios", label: "Ver planes", icon: <Sparkles /> },
];

export default async function CampusLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("estudiante");
  // Cuenta de prueba gratuita (sin plan): mientras no termine la prueba
  // va a presentarla; al terminarla, su panel solo muestra el informe —
  // se renderiza en lugar de la página pedida, sea cual sea (el layout no
  // conoce la ruta, y redirigir a la misma URL haría un bucle).
  const esPrueba = await esCuentaPruebaGratuita(profile);
  if (esPrueba) {
    const estado = await getEstadoPrueba(profile.id);
    if (!estado.finalizada) redirect("/prueba-gratuita");
  }

  return (
    <DashboardShell
      panelLabel="Campus"
      navItems={esPrueba ? navItemsPrueba : navItems}
      pageSubtitle={esPrueba ? "Prueba gratuita" : "Tu campus"}
      profile={profile}
    >
      {esPrueba ? <MiInformeContenido profile={profile} /> : children}
    </DashboardShell>
  );
}
