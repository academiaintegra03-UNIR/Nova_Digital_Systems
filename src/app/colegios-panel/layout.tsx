import { BarChart3, ClipboardList, FileText, GraduationCap, Home, Layers } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";

const navItems: DashboardNavItem[] = [
  { href: "/colegios-panel", label: "Resumen institucional", icon: <Home /> },
  { href: "/colegios-panel/estudiantes", label: "Estudiantes", icon: <GraduationCap /> },
  { href: "/colegios-panel/grupos", label: "Grupos", icon: <Layers /> },
  { href: "/colegios-panel/resultados", label: "Resultados", icon: <BarChart3 /> },
  { href: "/colegios-panel/simulacros", label: "Simulacros", icon: <ClipboardList /> },
  { href: "/colegios-panel/informes", label: "Informes", icon: <FileText /> },
];

export default async function ColegiosPanelLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("colegio");

  return (
    <DashboardShell
      panelLabel="Panel de colegios"
      navItems={navItems}
      pageSubtitle="Panel institucional"
      profile={profile}
    >
      {children}
    </DashboardShell>
  );
}
