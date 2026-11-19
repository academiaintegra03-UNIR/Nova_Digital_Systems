"use client";

import * as React from "react";
import { ExternalLink, FilePenLine } from "lucide-react";
import { toast } from "sonner";
import { calificarEntregaAction } from "@/app/tutores/materias/actions";
import type { EntregaPorCalificar } from "@/lib/types/panels";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ListRow } from "@/components/shared/list-row";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function CalificarDialog({ entrega }: { entrega: EntregaPorCalificar }) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [isPending, startTransition] = React.useTransition();
  // El enlace lo escribe el estudiante: solo se abre si es http(s).
  const enlace = entrega.respuestaLink && /^https?:\/\//i.test(entrega.respuestaLink) ? entrega.respuestaLink : null;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await calificarEntregaAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(`Calificaste a ${entrega.studentNombre}.`);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Calificar</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={entrega.id} />
          <DialogHeader>
            <DialogTitle>{entrega.actividadTitulo}</DialogTitle>
            <DialogDescription>
              {entrega.studentNombre} · {entrega.materiaNombre}
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {enlace ? (
            <Button variant="outline" size="sm" className="w-fit gap-1.5" asChild>
              <a href={enlace} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5" aria-hidden="true" /> Ver entrega
              </a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">El estudiante no adjuntó un enlace.</p>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`nota-${entrega.id}`}>Nota (0.0 a 5.0)</Label>
            <Input
              id={`nota-${entrega.id}`}
              name="nota"
              type="number"
              min={0}
              max={5}
              step={0.1}
              required
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`comentario-${entrega.id}`}>Comentario para el estudiante (opcional)</Label>
            <Textarea id={`comentario-${entrega.id}`} name="comentario" maxLength={1000} disabled={isPending} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar calificación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GradingList({ entregas }: { entregas: EntregaPorCalificar[] }) {
  if (entregas.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No tienes entregas pendientes por calificar.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {entregas.map((e) => (
          <ListRow
            key={e.id}
            icon={FilePenLine}
            tone="warning"
            title={e.actividadTitulo}
            subtitle={`${e.studentNombre} · ${e.materiaNombre}`}
            trailing={<CalificarDialog entrega={e} />}
          />
        ))}
      </CardContent>
    </Card>
  );
}
