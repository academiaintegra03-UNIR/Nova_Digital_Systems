import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export interface CourseSidebarInfoRow {
  label: string;
  value: string;
}

export interface CourseSidebarLink {
  href: string;
  label: string;
}

/** Barra lateral del curso (grupo+materia) — reemplaza la grilla de
 * tiles de colores que se sentía "muy de IA": una tarjeta de datos y una
 * lista simple de accesos, como el panel lateral de un campus real. */
export function CourseSidebar({
  infoTitle,
  infoRows,
  links,
}: {
  infoTitle: string;
  infoRows: CourseSidebarInfoRow[];
  links: CourseSidebarLink[];
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-64">
      <div>
        <h3 className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">{infoTitle}</h3>
        <Card>
          <CardContent className="py-3.5">
            <dl className="flex flex-col gap-2 text-sm">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="font-semibold text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">Otros accesos</h3>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block px-3.5 py-2.5 text-sm font-semibold text-teal hover:bg-muted/50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
