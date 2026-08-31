"use client";

import { ExternalLink, Pencil, Video } from "lucide-react";
import { createClaseAction, deleteClaseAction, updateClaseAction } from "@/app/admin/clases/actions";
import { isPastClase } from "@/lib/clases";
import type { AdminGrupoRow, ClaseRow, Materia, TutorOption } from "@/lib/types/panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ClaseFormDialog } from "@/features/admin/clase-form-dialog";
import { DeleteClaseDialog } from "@/features/admin/delete-clase-dialog";

type GrupoOption = Pick<AdminGrupoRow, "id" | "name" | "colegioNombre" | "tutorId">;

function formatScheduled(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClasesTable({
  clases,
  grupos,
  materias,
  tutores,
}: {
  clases: ClaseRow[];
  grupos: GrupoOption[];
  materias: Materia[];
  tutores: TutorOption[];
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sesión</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Materia</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Recursos</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  Todavía no hay clases programadas.
                </TableCell>
              </TableRow>
            ) : (
              clases.map((clase) => {
                const isPast = isPastClase(clase);
                return (
                  <TableRow key={clase.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{clase.nombre}</span>
                        <StatusBadge tone={isPast ? "neutral" : "info"}>{isPast ? "Pasada" : "Próxima"}</StatusBadge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{clase.grupoNombre}</TableCell>
                    <TableCell className="text-muted-foreground">{clase.materiaNombre}</TableCell>
                    <TableCell className="text-muted-foreground">{clase.tutorNombre ?? "Sin asignar"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatScheduled(clase.scheduledAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {clase.meetingLink ? (
                          <a
                            href={clase.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-primary"
                            title="Abrir link de la clase"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        ) : null}
                        {clase.recordingLink ? (
                          <a
                            href={clase.recordingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-primary"
                            title="Ver grabación"
                          >
                            <Video className="size-4" />
                          </a>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <ClaseFormDialog
                          clase={clase}
                          grupos={grupos}
                          materias={materias}
                          tutores={tutores}
                          createAction={createClaseAction}
                          updateAction={updateClaseAction}
                          trigger={
                            <Button variant="ghost" size="icon-sm" aria-label={`Editar ${clase.nombre}`}>
                              <Pencil />
                            </Button>
                          }
                        />
                        <DeleteClaseDialog clase={clase} deleteAction={deleteClaseAction} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
