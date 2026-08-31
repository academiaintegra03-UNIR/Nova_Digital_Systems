import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface QuickLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Fila de accesos rápidos tipo LMS — mismo componente reusado en los
 * home de campus, acudientes, colegios y tutores para que los cuatro
 * paneles compartan el mismo lenguaje visual. */
export function QuickLinkTile({ href, label, icon: Icon }: QuickLink) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/40">
        <CardContent className="flex flex-col items-center gap-2 py-5 text-center">
          <Icon className="size-5 text-primary" aria-hidden="true" />
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

export function QuickLinksRow({ links }: { links: QuickLink[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {links.map((link) => (
        <QuickLinkTile key={link.href} {...link} />
      ))}
    </div>
  );
}
