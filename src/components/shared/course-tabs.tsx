"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface CourseTab {
  href: string;
  label: string;
}

/** Barra de pestañas del "curso" (grupo+materia) — cada pestaña es una
 * ruta real (no un tab client-side), mismo criterio de estado activo que
 * usa el nav lateral de DashboardShell (src/components/layout/dashboard-shell.tsx). */
export function CourseTabs({ tabs }: { tabs: CourseTab[] }) {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
              isActive
                ? "border-teal text-teal"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
