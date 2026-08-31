"use client";

import * as React from "react";
import { toast } from "sonner";
import { createMateriaAction, type MateriaActionState } from "@/app/admin/materias/actions";
import type { AdminGrupoRow, ClaseRow, Materia, TutorOption } from "@/lib/types/panels";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NO_TUTOR = "__none__";
const NEW_MATERIA = "__new__";
const SIN_COLEGIO_LABEL = "Familiar / individual / libre";

type GrupoOption = Pick<AdminGrupoRow, "id" | "name" | "colegioNombre" | "tutorId">;
type ClaseActionResult = { error?: string; success?: boolean };
type ClaseAction = (formData: FormData) => Promise<ClaseActionResult>;

/** "2026-08-26T14:30" en hora local — lo que espera un <input type="datetime-local">. */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ClaseFormDialog({
  clase,
  grupos,
  materias,
  tutores,
  createAction,
  updateAction,
  trigger,
}: {
  clase?: ClaseRow;
  grupos: GrupoOption[];
  materias: Materia[];
  /** Omitido = oculta el selector de tutor (uso del tutor: la clase
   * siempre queda a su nombre, lo decide la Server Action). */
  tutores?: TutorOption[];
  createAction: ClaseAction;
  updateAction: ClaseAction;
  trigger: React.ReactNode;
}) {
  const isEdit = Boolean(clase);
  const [open, setOpen] = React.useState(false);
  const [grupoId, setGrupoId] = React.useState(clase?.grupoId ?? "");
  const [materiaId, setMateriaId] = React.useState(clase?.materiaId ?? "");
  const [newMateriaName, setNewMateriaName] = React.useState("");
  const [tutorId, setTutorId] = React.useState(clase?.tutorId ?? "");
  const [error, setError] = React.useState<string>();
  const [isPending, startTransition] = React.useTransition();
  const [isCreatingMateria, setIsCreatingMateria] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const gruposByColegio = new Map<string, GrupoOption[]>();
  for (const g of grupos) {
    const key = g.colegioNombre ?? SIN_COLEGIO_LABEL;
    const existing = gruposByColegio.get(key) ?? [];
    existing.push(g);
    gruposByColegio.set(key, existing);
  }
  const grupoGroupLabels = Array.from(gruposByColegio.keys()).sort((a, b) =>
    a === SIN_COLEGIO_LABEL ? 1 : b === SIN_COLEGIO_LABEL ? -1 : a.localeCompare(b)
  );

  function resetState() {
    setGrupoId(clase?.grupoId ?? "");
    setMateriaId(clase?.materiaId ?? "");
    setNewMateriaName("");
    setTutorId(clase?.tutorId ?? "");
    setError(undefined);
  }

  function handleGrupoChange(next: string) {
    setGrupoId(next);
    // Sugiere el tutor del grupo por defecto — el admin puede cambiarlo.
    const grupo = grupos.find((g) => g.id === next);
    if (grupo?.tutorId && !tutorId) setTutorId(grupo.tutorId);
  }

  async function handleSubmit(formData: FormData) {
    setError(undefined);

    let effectiveMateriaId = materiaId;
    if (materiaId === NEW_MATERIA) {
      if (!newMateriaName.trim()) {
        setError("Escribe el nombre de la nueva materia.");
        return;
      }
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
    formData.set("materia_id", effectiveMateriaId);

    startTransition(async () => {
      const result = await (isEdit ? updateAction : createAction)(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(isEdit ? "Clase actualizada." : "Clase programada.");
      setOpen(false);
      setMateriaId(effectiveMateriaId);
      if (!isEdit) formRef.current?.reset();
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSubmit(new FormData(e.currentTarget));
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form ref={formRef} onSubmit={onSubmit}>
          {isEdit ? <input type="hidden" name="id" value={clase!.id} /> : null}
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar clase" : "Programar clase"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Puedes agregar el link de la grabación una vez la clase ya se dio."
                : "Elige el grupo, la materia y cuándo es — el link se puede completar después si aún no lo tienes."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clase-grupo">Grupo</Label>
              <input type="hidden" name="grupo_id" value={grupoId} />
              <Select value={grupoId} onValueChange={handleGrupoChange} disabled={busy}>
                <SelectTrigger id="clase-grupo" className="w-full">
                  <SelectValue placeholder="Selecciona un grupo" />
                </SelectTrigger>
                <SelectContent>
                  {grupoGroupLabels.map((label) => (
                    <SelectGroup key={label}>
                      <SelectLabel>{label}</SelectLabel>
                      {gruposByColegio.get(label)!.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clase-materia">Materia</Label>
              <Select value={materiaId} onValueChange={setMateriaId} disabled={busy}>
                <SelectTrigger id="clase-materia" className="w-full">
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

            {tutores ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="clase-tutor">Tutor (opcional)</Label>
                <input type="hidden" name="tutor_id" value={tutorId} />
                <Select
                  value={tutorId || NO_TUTOR}
                  onValueChange={(next) => setTutorId(next === NO_TUTOR ? "" : next)}
                  disabled={busy}
                >
                  <SelectTrigger id="clase-tutor" className="w-full">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TUTOR}>Sin asignar</SelectItem>
                    {tutores.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clase-nombre">Nombre de la sesión</Label>
              <Input
                id="clase-nombre"
                name="nombre"
                placeholder="Ej. Clase 1: Ecuaciones lineales"
                defaultValue={clase?.nombre}
                required
                disabled={busy}
              />
            </div>

            <div className="grid grid-cols-[1.4fr_1fr] gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="clase-fecha">Fecha y hora</Label>
                <Input
                  id="clase-fecha"
                  name="scheduled_at"
                  type="datetime-local"
                  defaultValue={clase ? toDatetimeLocal(clase.scheduledAt) : undefined}
                  required
                  disabled={busy}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="clase-duracion">Duración (min)</Label>
                <Input
                  id="clase-duracion"
                  name="duration_minutes"
                  type="number"
                  min={1}
                  defaultValue={clase?.durationMinutes ?? undefined}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clase-link">Link de la clase (opcional)</Label>
              <Input
                id="clase-link"
                name="meeting_link"
                type="url"
                placeholder="https://meet.google.com/..."
                defaultValue={clase?.meetingLink ?? ""}
                disabled={busy}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clase-grabacion">Link de la grabación (opcional)</Label>
              <Input
                id="clase-grabacion"
                name="recording_link"
                type="url"
                placeholder="https://..."
                defaultValue={clase?.recordingLink ?? ""}
                disabled={busy}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
