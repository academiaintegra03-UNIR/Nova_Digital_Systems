import { BarChart3, CreditCard, FileText, Home, Mail, Users } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";

const navItems: DashboardNavItem[] = [
  { href: "/acudientes", label: "Resumen", icon: <Home /> },
  { href: "/acudientes/mi-grupo", label: "Mi grupo", icon: <Users /> },
  { href: "/acudientes/progreso", label: "Progreso", icon: <BarChart3 /> },
  { href: "/acudientes/reportes", label: "Reportes", icon: <FileText /> },
  { href: "/acudientes/pagos", label: "Pagos", icon: <CreditCard /> },
  { href: "/acudientes/mensajes", label: "Mensajes", icon: <Mail /> },
];

export default async function AcudientesLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("acudiente");

  return (
    <DashboardShell
      panelLabel="Panel de acudientes"
      navItems={navItems}
      pageSubtitle="Panel del acudiente"
      profile={profile}
    >
      {children}
    </DashboardShell>
  );
}
