import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { preicfes2027 } from "@/lib/data/preicfes-2027";
import { Card, CardContent } from "@/components/ui/card";
import { IconTile } from "@/components/shared/icon-tile";
import { cn } from "@/lib/utils";

/** Tarjetas que llevan a la página con los precios del preicfes de
 * grado 11 del próximo año. Se usa en /planes-precios y /colegios. */
export function Preicfes2027Precios({ className }: { className?: string }) {
  const { grado, anio, brochures } = preicfes2027;

  return (
    <section aria-labelledby="titulo-preicfes-2027" className={className}>
      <h2 id="titulo-preicfes-2027" className="mb-2 text-center text-2xl font-extrabold text-heading">
        Preicfes grado {grado} — {anio}
      </h2>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Matrículas abiertas para el próximo año. Consulta los precios según el tamaño del grupo.
      </p>
      <div className={cn("mx-auto grid max-w-3xl grid-cols-1 gap-4", brochures.length > 1 && "sm:grid-cols-2")}>
        {brochures.map((b) => (
          <Link
            key={b.titulo}
            href={b.href}
            className="group block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Card className="h-full transition-colors group-hover:ring-primary">
              <CardContent className="flex h-full flex-col">
                <IconTile icon={b.icon} tone="secondary" className="mb-3" />
                <div className="mb-1 text-lg font-extrabold text-heading">{b.titulo}</div>
                <div className="mb-2 w-fit rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                  {b.cupo}
                </div>
                <p className="mb-4 flex-1 text-sm text-muted-foreground">{b.descripcion}</p>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-heading underline-offset-4 group-hover:underline">
                  Ver precios <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
