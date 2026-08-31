import { Bot, BookOpen, CalendarClock, ClipboardList, CreditCard, Home, Layers, Tag, Users } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";

// Programas, Matrículas y Reportes siguen con datos de prueba simulados —
// ocultos del menú hasta que tengan datos reales. Las páginas en sí no se
// borraron, solo el enlace en el nav.
const navItems: DashboardNavItem[] = [
  { href: "/admin", label: "Resumen general", icon: <Home /> },
  { href: "/admin/usuarios", label: "Usuarios", icon: <Users /> },
  { href: "/admin/grupos", label: "Grupos", icon: <Layers /> },
  { href: "/admin/materias", label: "Materias", icon: <BookOpen /> },
  { href: "/admin/clases", label: "Clases", icon: <CalendarClock /> },
  { href: "/admin/planes", label: "Planes", icon: <Tag /> },
  { href: "/admin/pagos", label: "Pagos", icon: <CreditCard /> },
  { href: "/admin/diagnosticos", label: "Diagnósticos", icon: <ClipboardList /> },
  { href: "/admin/ia", label: "IA (Álex)", icon: <Bot /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("administrador");

  return (
    <DashboardShell
      panelLabel="Administración"
      navItems={navItems}
      pageSubtitle="Datos de prueba — panel administrativo"
      profile={profile}
    >
      {children}
    </DashboardShell>
  );
}
