"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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

type HiloActionResult = { error?: string; success?: boolean; id?: string };

export function CreateHiloDialog({
  grupoId,
  materiaId,
  createAction,
  hiloBasePath,
}: {
  grupoId: string;
  materiaId: string;
  createAction: (formData: FormData) => Promise<HiloActionResult>;
  /** Ej. "/tutores/materias/xyz/foro" — a donde navegar tras crear. */
  hiloBasePath: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    setError(undefined);
    formData.set("grupo_id", grupoId);
    formData.set("materia_id", materiaId);
    startTransition(async () => {
      const result = await createAction(formData);
      if (result.error || !result.id) {
        setError(result.error ?? "No se pudo crear el hilo.");
        return;
      }
      toast.success("Hilo creado.");
      setOpen(false);
      router.push(`${hiloBasePath}/${result.id}`);
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
        setError(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">+ Nuevo hilo</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo hilo</DialogTitle>
            <DialogDescription>Escribe tu pregunta o inquietud — la ven todos en esta materia.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hilo-titulo">Título</Label>
              <Input id="hilo-titulo" name="titulo" placeholder="Ej. Duda sobre el taller 2" required disabled={isPending} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear hilo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
