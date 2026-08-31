import { notFound } from "next/navigation";
import { CalendarClock, ExternalLink, Pencil, Video } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/require-role";
import { getGrupoMateriaContextForTutor } from "@/lib/queries/grupo-materias";
import { getClasesParaGrupos } from "@/lib/queries/clases";
import { splitProximasPasadas } from "@/lib/clases";
import { createClaseAction, deleteClaseAction, updateClaseAction } from "@/app/tutores/actions";
import type { AdminGrupoRow } from "@/lib/types/panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ClaseFormDialog } from "@/features/admin/clase-form-dialog";
import { DeleteClaseDialog } from "@/features/admin/delete-clase-dialog";

function formatScheduled(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function TutorMateriaClasesPage({
  params,
}: PageProps<"/tutores/materias/[grupoMateriaId]/clases">) {
  const { grupoMateriaId } = await params;
  const profile = await requireRole("tutor");
  const admin = createAdminClient();
  const curso = await getGrupoMateriaContextForTutor(admin, grupoMateriaId, profile.id);
  if (!curso) notFound();

  const clases = await getClasesParaGrupos(admin, [curso.grupoId], { materiaId: curso.materiaId });
  const { proximas, pasadas } = splitProximasPasadas(clases);
  const grabaciones = pasadas.filter((c) => c.recordingLink);

  const grupoOption: Pick<AdminGrupoRow, "id" | "name" | "colegioNombre" | "tutorId"> = {
    id: curso.grupoId,
    name: curso.grupoNombre,
    colegioNombre: null,
    tutorId: profile.id,
  };
  const materias = [{ id: curso.materiaId, name: curso.materiaNombre }];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <ClaseFormDialog
          grupos={[grupoOption]}
          materias={materias}
          createAction={createClaseAction}
          updateAction={updateClaseAction}
          trigger={<Button size="sm">+ Programar clase</Button>}
        />
      </div>

      {proximas[0] ? (
        <Card className="mb-6 border-teal/40 bg-teal/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-5">
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-teal">Próxima clase</div>
              <div className="text-base font-bold text-foreground">{proximas[0].nombre}</div>
              <div className="text-sm text-muted-foreground">
                {formatScheduled(proximas[0].scheduledAt)}
                {proximas[0].durationMinutes ? ` · ${proximas[0].durationMinutes} min` : ""}
              </div>
            </div>
            {proximas[0].meetingLink ? (
              <Button asChild>
                <a href={proximas[0].meetingLink} target="_blank" rel="noreferrer" className="gap-1.5">
                  <ExternalLink className="size-3.5" /> Unirse
                </a>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center py-6 text-center text-sm text-muted-foreground">
            <CalendarClock className="mb-2 size-5" aria-hidden="true" />
            Todavía no hay clases programadas para esta materia.
          </CardContent>
        </Card>
      )}

      {grabaciones.length > 0 ? (
        <div className="mb-6">
          <h2 className="mb-3 text-base font-bold text-primary">Grabaciones disponibles</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grabaciones.map((clase) => (
              <Card key={clase.id}>
                <CardContent className="py-4">
                  <div className="mb-1 text-sm font-semibold text-foreground">{clase.nombre}</div>
                  <div className="mb-3 text-xs text-muted-foreground">{formatScheduled(clase.scheduledAt)}</div>
                  <Button size="sm" variant="outline" asChild>
                    <a href={clase.recordingLink!} target="_blank" rel="noreferrer" className="gap-1.5">
                      <Video className="size-3.5" /> Ver grabación
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-base font-bold text-primary">Listado de sesiones</h2>
        {clases.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin sesiones todavía.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sesión</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...proximas, ...pasadas].map((clase) => {
                const isPast = pasadas.includes(clase);
                return (
                  <TableRow key={clase.id}>
                    <TableCell className="font-semibold">{clase.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{formatScheduled(clase.scheduledAt)}</TableCell>
                    <TableCell>
                      <StatusBadge tone={isPast ? "neutral" : "info"}>{isPast ? "Pasada" : "Próxima"}</StatusBadge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <ClaseFormDialog
                          clase={clase}
                          grupos={[grupoOption]}
                          materias={materias}
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
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
