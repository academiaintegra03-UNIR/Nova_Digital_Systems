"use client";

import * as React from "react";
import { toast } from "sonner";
import { createMateriaAction, type MateriaActionState } from "@/app/admin/materias/actions";
import { addMateriaToGrupoAction } from "@/app/tutores/materias/actions";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NEW_MATERIA = "__new__";

export function AddMateriaToGrupoDialog({
  grupos,
  materias,
}: {
  grupos: { id: string; name: string }[];
  materias: Materia[];
}) {
  const [open, setOpen] = React.useState(false);
  const [grupoId, setGrupoId] = React.useState(grupos[0]?.id ?? "");
  const [materiaId, setMateriaId] = React.useState("");
  const [newMateriaName, setNewMateriaName] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [isPending, startTransition] = React.useTransition();
  const [isCreatingMateria, setIsCreatingMateria] = React.useState(false);

  function resetState() {
    setGrupoId(grupos[0]?.id ?? "");
    setMateriaId("");
    setNewMateriaName("");
    setError(undefined);
  }

  async function handleSubmit() {
    setError(undefined);
    if (!grupoId) return setError("Elige un grupo.");

    let effectiveMateriaId = materiaId;
    if (materiaId === NEW_MATERIA) {
      if (!newMateriaName.trim()) return setError("Escribe el nombre de la nueva materia.");
      setIsCreatingMateria(true);
      const fd = new FormData();
      fd.set("name", newMateriaName.trim());
      const result: MateriaActionState = await createMateriaAction(fd);
      setIsCreatingMateria(false);
      if (result.error || !result.id) {
        setError(result.error ?? "No se pudo crear la materia.");
        return;
      }
      effectiveMateriaId = result.id;
    }
    if (!effectiveMateriaId) return setError("Elige una materia.");

    startTransition(async () => {
      const fd = new FormData();
      fd.set("grupo_id", grupoId);
      fd.set("materia_id", effectiveMateriaId);
      const result = await addMateriaToGrupoAction(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Materia agregada al grupo.");
      setOpen(false);
    });
  }

  const busy = isPending || isCreatingMateria;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">+ Agregar materia</Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Agregar materia a un grupo</DialogTitle>
            <DialogDescription>Elige uno de tus grupos y la materia que va a tener.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grupo-materia-grupo">Grupo</Label>
              <Select value={grupoId} onValueChange={setGrupoId} disabled={busy}>
                <SelectTrigger id="grupo-materia-grupo" className="w-full">
                  <SelectValue placeholder="Selecciona un grupo" />
                </SelectTrigger>
                <SelectContent>
                  {grupos.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grupo-materia-materia">Materia</Label>
              <Select value={materiaId} onValueChange={setMateriaId} disabled={busy}>
                <SelectTrigger id="grupo-materia-materia" className="w-full">
                  <SelectValue placeholder="Selecciona una materia" />
                </SelectTrigger>
                <SelectContent>
                  {materias.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                  <SelectItem value={NEW_MATERIA}>+ Crear nueva materia…</SelectItem>
                </SelectContent>
              </Select>
              {materiaId === NEW_MATERIA ? (
                <Input
                  placeholder="Ej. Química"
                  value={newMateriaName}
                  onChange={(e) => setNewMateriaName(e.target.value)}
                  disabled={busy}
                  autoFocus
                />
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy ? "Guardando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
