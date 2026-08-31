import { notFound } from "next/navigation";
import { ClipboardList, ExternalLink, Pencil } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/require-role";
import { getGrupoMateriaContextForTutor } from "@/lib/queries/grupo-materias";
import { getActividadesParaGrupoMateria, getEntregaRosterParaActividad } from "@/lib/queries/actividades";
import {
  createActividadAction,
  deleteActividadAction,
  updateActividadAction,
} from "@/app/tutores/materias/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActividadFormDialog } from "@/features/tutores/actividad-form-dialog";
import { DeleteActividadDialog } from "@/features/tutores/delete-actividad-dialog";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function TutorMateriaActividadesPage({
  params,
}: PageProps<"/tutores/materias/[grupoMateriaId]/actividades">) {
  const { grupoMateriaId } = await params;
  const profile = await requireRole("tutor");
  const admin = createAdminClient();
  const curso = await getGrupoMateriaContextForTutor(admin, grupoMateriaId, profile.id);
  if (!curso) notFound();

  const actividadesBase = await getActividadesParaGrupoMateria(admin, curso.grupoId, curso.materiaId);
  const actividades = await Promise.all(
    actividadesBase.map(async (a) => ({ ...a, roster: await getEntregaRosterParaActividad(admin, a.id, curso.grupoId) }))
  );

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <ActividadFormDialog
          grupoId={curso.grupoId}
          materiaId={curso.materiaId}
          createAction={createActividadAction}
          updateAction={updateActividadAction}
          trigger={<Button size="sm">+ Crear actividad</Button>}
        />
      </div>

      {actividades.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
            <ClipboardList className="mb-2 size-6" aria-hidden="true" />
            Todavía no hay actividades para esta materia.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {actividades.map((actividad) => {
            const entregadas = actividad.roster.filter((r) => r.estado === "entregada").length;
            return (
              <div key={actividad.id} className="py-5 first:pt-0">
                <div className="mb-1.5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">{actividad.titulo}</h3>
                    <p className="text-xs text-muted-foreground">
                      {actividad.fechaLimite ? `Fecha límite: ${formatFecha(actividad.fechaLimite)}` : "Sin fecha límite"}
                      {" · "}
                      {entregadas} de {actividad.roster.length} entregada{entregadas === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {actividad.recursoLink ? (
                      <Button size="icon-sm" variant="ghost" asChild aria-label="Ver recurso">
                        <a href={actividad.recursoLink} target="_blank" rel="noreferrer">
                          <ExternalLink />
                        </a>
                      </Button>
                    ) : null}
                    <ActividadFormDialog
                      grupoId={curso.grupoId}
                      materiaId={curso.materiaId}
                      actividad={actividad}
                      createAction={createActividadAction}
                      updateAction={updateActividadAction}
                      trigger={
                        <Button variant="ghost" size="icon-sm" aria-label={`Editar ${actividad.titulo}`}>
                          <Pencil />
                        </Button>
                      }
                    />
                    <DeleteActividadDialog actividad={actividad} deleteAction={deleteActividadAction} />
                  </div>
                </div>
                {actividad.descripcion ? (
                  <p className="mb-3 text-sm text-muted-foreground">{actividad.descripcion}</p>
                ) : null}
                {actividad.roster.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {actividad.roster.map((r) => (
                        <TableRow key={r.studentId}>
                          <TableCell>{r.studentNombre}</TableCell>
                          <TableCell className={r.estado === "entregada" ? "font-semibold text-teal" : "text-muted-foreground"}>
                            {r.estado === "entregada" ? "Entregada" : "Pendiente"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
