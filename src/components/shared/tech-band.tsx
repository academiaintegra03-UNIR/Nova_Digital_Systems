import { cn } from "@/lib/utils";

/**
 * Banda de página con el lenguaje visual "tech" en versión clara: degradado de
 * la paleta Glacier + retícula sutil. El contenido se mantiene sobre un fondo
 * claro para que siempre se lea bien. Úsala en lugar de repetir
 * `<section className="bg-…">` con colores sueltos.
 *
 *  tint    Glacier marcado  → bloques destacados (ej. diagnóstico gratuito)
 *  band    Glacier suave    → bandas de apoyo (ej. colegios)
 *  surface Superficie clara → bandas de lectura larga (ej. metodología)
 */
const TONES = {
  tint: "bg-linear-to-br from-secondary via-background to-secondary",
  band: "bg-linear-to-b from-muted via-background to-muted",
  surface: "bg-linear-to-b from-card to-muted",
} as const;

export function TechBand({
  tone = "tint",
  className,
  children,
}: {
  tone?: keyof typeof TONES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden border-y border-border", TONES[tone], className)}>
      {children}
    </section>
  );
}
