"use client";

import * as React from "react";
import { toast } from "sonner";
import { entregarActividadAction } from "@/app/campus/mis-materias/actions";
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

export function EntregarActividadDialog({ actividadId, titulo }: { actividadId: string; titulo: string }) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await entregarActividadAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Actividad entregada.");
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
        setError(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">Marcar como entregada</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <input type="hidden" name="actividad_id" value={actividadId} />
          <DialogHeader>
            <DialogTitle>Entregar actividad</DialogTitle>
            <DialogDescription>
              <strong>{titulo}</strong> — si tienes un link con tu respuesta (documento, foto, etc.) puedes
              dejarlo aquí, es opcional.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entrega-link">Link de tu respuesta (opcional)</Label>
              <Input id="entrega-link" name="respuesta_link" type="url" placeholder="https://..." disabled={isPending} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enviando..." : "Confirmar entrega"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
