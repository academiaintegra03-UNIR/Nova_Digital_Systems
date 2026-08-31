"use client";

import * as React from "react";
import { toast } from "sonner";
import { createMateriaAction, updateMateriaAction } from "@/app/admin/materias/actions";
import type { Materia } from "@/lib/types/panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function MateriaFormDialog({
  materia,
  trigger,
}: {
  materia?: Materia;
  trigger: React.ReactNode;
}) {
  const isEdit = Boolean(materia);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [isPending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await (isEdit ? updateMateriaAction : createMateriaAction)(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(isEdit ? "Materia actualizada." : "Materia creada.");
      setOpen(false);
      if (!isEdit) formRef.current?.reset();
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSubmit(new FormData(e.currentTarget));
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); setError(undefined); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form ref={formRef} onSubmit={onSubmit}>
          {isEdit ? <input type="hidden" name="id" value={materia!.id} /> : null}
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar materia" : "Crear materia"}</DialogTitle>
            <DialogDescription>Ej. Matemáticas, Física, Química.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="materia-name">Nombre</Label>
              <Input id="materia-name" name="name" defaultValue={materia?.name} required disabled={isPending} />
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
