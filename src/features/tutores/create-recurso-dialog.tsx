"use client";

import * as React from "react";
import { toast } from "sonner";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RecursoActionResult = { error?: string; success?: boolean };

export function CreateRecursoDialog({
  grupoId,
  materiaId,
  createAction,
}: {
  grupoId: string;
  materiaId: string;
  createAction: (formData: FormData) => Promise<RecursoActionResult>;
}) {
  const [open, setOpen] = React.useState(false);
  const [tipo, setTipo] = React.useState<"pdf" | "link">("link");
  const [error, setError] = React.useState<string>();
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    setError(undefined);
    formData.set("grupo_id", grupoId);
    formData.set("materia_id", materiaId);
    formData.set("tipo", tipo);
    startTransition(async () => {
      const result = await createAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Recurso agregado.");
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
        if (next) {
          setError(undefined);
          setTipo("link");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">+ Agregar recurso</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar recurso</DialogTitle>
            <DialogDescription>
              Un link a un PDF (ej. Google Drive) u otro material de apoyo para esta materia.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recurso-titulo">Título</Label>
              <Input id="recurso-titulo" name="titulo" placeholder="Ej. Guía de ecuaciones lineales" required disabled={isPending} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recurso-tipo">Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as "pdf" | "link")} disabled={isPending}>
                <SelectTrigger id="recurso-tipo" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="link">Link / página</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recurso-url">Link</Label>
              <Input id="recurso-url" name="url" type="url" placeholder="https://..." required disabled={isPending} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
