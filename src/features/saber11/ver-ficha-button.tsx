"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Colegio } from "@/lib/saber11/utils";
import { getFichaColegioAction } from "@/features/saber11/actions";
import { FichaColegio } from "@/features/saber11/ficha-colegio";

/**
 * Botón "Ver ficha" de la tabla: abre la ficha del colegio en una ventana
 * sin salir del explorador (se conservan filtros, orden y página). Los datos
 * se piden al abrirla; la ficha también tiene su propia página para
 * compartirla.
 */
export function VerFichaButton({ id, nombre, ubicacion }: { id: string; nombre: string; ubicacion: string }) {
  const [colegio, setColegio] = useState<Colegio | null>(null);
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function cargar(open: boolean) {
    if (!open || colegio) return;
    setError(false);
    startTransition(async () => {
      const c = await getFichaColegioAction(id);
      if (c) setColegio(c);
      else setError(true);
    });
  }

  return (
    <Dialog onOpenChange={cargar}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label={`Ver ficha de ${nombre}`}>
          Ver ficha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl font-extrabold text-heading">{nombre}</DialogTitle>
          <DialogDescription>
            {ubicacion} · Código DANE {id}
          </DialogDescription>
        </DialogHeader>

        {colegio ? (
          <>
            <FichaColegio c={colegio} />
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/alianza-colegios/${id}`}>
                  Abrir en su propia página <ExternalLink aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </>
        ) : error ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No se pudo cargar la ficha. Intenta de nuevo.</p>
        ) : (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground" aria-live="polite">
            {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Cargando ficha…
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
