import type * as React from "react";
import Link from "next/link";
import type { Resource } from "@/lib/types/content";

const LINK_CLASS =
  "block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>[data-slot=card]]:h-full [&>[data-slot=card]]:hover:ring-primary";

/**
 * Envuelve la tarjeta de un recurso en el enlace que le corresponde: externo
 * en pestaña nueva, interno con <Link>. Sin href devuelve la tarjeta tal
 * cual, para que solo los recursos reales muestren la mano al pasar el cursor.
 */
export function ResourceLink({ resource, children }: { resource: Resource; children: React.ReactNode }) {
  const { href, title } = resource;
  if (!href) return children;

  if (/^https?:\/\//.test(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${title} (se abre en otra pestaña)`}
        className={LINK_CLASS}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={LINK_CLASS}>
      {children}
    </Link>
  );
}
