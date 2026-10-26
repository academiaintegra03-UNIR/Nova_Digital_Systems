"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

/** La prueba lee su borrador de localStorage al inicializar el estado,
 * así que se renderiza solo en el navegador (sin SSR), para que no haya
 * diferencia de hidratación entre servidor y cliente. */
export const PruebaMateriaCliente = dynamic(
  () => import("@/features/prueba-gratuita/prueba-materia").then((m) => m.PruebaMateria),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-24" role="status">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Cargando la prueba…</span>
      </div>
    ),
  }
);
