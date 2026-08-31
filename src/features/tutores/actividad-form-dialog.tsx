"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ActividadRow } from "@/lib/types/panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ActividadActionResult = { error?: string; success?: boolean };
type ActividadAction = (formData: FormData) => Promise<ActividadActionResult>;

/** "2026-08-26T14:30" en hora local — lo que espera un <input type="datetime-local">. */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ActividadFormDialog({
  grupoId,
  materiaId,
  actividad,
  createAction,
  updateAction,
  trigger,
}: {
  grupoId: string;
  materiaId: string;
  actividad?: ActividadRow;
  createAction: ActividadAction;
  updateAction: ActividadAction;
  trigger: React.ReactNode;
}) {
  const isEdit = Boolean(actividad);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    setError(undefined);
    formData.set("grupo_id", grupoId);
    formData.set("materia_id", materiaId);
    startTransition(async () => {
      const result = await (isEdit ? updateAction : createAction)(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(isEdit ? "Actividad actualizada." : "Actividad creada.");
      setOpen(false);
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSubmit(new FormData(e.currentTarget));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setError(undefined);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          {isEdit ? <input type="hidden" name="id" value={actividad!.id} /> : null}
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar actividad" : "Crear actividad"}</DialogTitle>
            <DialogDescription>
              La ven los estudiantes de este grupo en la materia — pueden marcarla como entregada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="actividad-titulo">Título</Label>
              <Input
                id="actividad-titulo"
                name="titulo"
                placeholder="Ej. Taller de factorización"
                defaultValue={actividad?.titulo}
                required
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="actividad-descripcion">Descripción (opcional)</Label>
              <Textarea
                id="actividad-descripcion"
                name="descripcion"
                placeholder="Instrucciones de la actividad..."
                defaultValue={actividad?.descripcion ?? ""}
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="actividad-fecha">Fecha límite (opcional)</Label>
              <Input
                id="actividad-fecha"
                name="fecha_limite"
                type="datetime-local"
                defaultValue={actividad?.fechaLimite ? toDatetimeLocal(actividad.fechaLimite) : undefined}
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="actividad-recurso">Link de recurso (opcional)</Label>
              <Input
                id="actividad-recurso"
                name="recurso_link"
                type="url"
                placeholder="https://..."
                defaultValue={actividad?.recursoLink ?? ""}
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
