import { CalendarClock, ClipboardList, ExternalLink, FileText, GraduationCap, Layers, Mail, Pencil, Video } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import { createClaseAction, deleteClaseAction, updateClaseAction } from "@/app/tutores/actions";
import { getClasesParaGrupos } from "@/lib/queries/clases";
import { splitProximasPasadas } from "@/lib/clases";
import type { AdminGrupoRow, ClaseRow, Materia } from "@/lib/types/panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { QuickLinksRow } from "@/components/shared/quick-link-tile";
import { ClaseFormDialog } from "@/features/admin/clase-form-dialog";
import { DeleteClaseDialog } from "@/features/admin/delete-clase-dialog";

type GrupoOption = Pick<AdminGrupoRow, "id" | "name" | "colegioNombre" | "tutorId">;

interface AgendaData {
  clases: ClaseRow[];
  grupos: GrupoOption[];
  materias: Materia[];
}

function formatScheduled(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getAgendaData(tutorId: string): Promise<AgendaData> {
  const admin = createAdminClient();

  const { data: grupoRows, error: gruposError } = await admin
    .from("grupos")
    .select("id, name, colegio_id, tutor_id")
    .eq("tutor_id", tutorId)
    .order("name");
  if (gruposError) console.error("Failed to load grupos for tutor agenda:", gruposError);

  const colegioIds = (grupoRows ?? []).map((g) => g.colegio_id).filter((id): id is string => Boolean(id));
  const { data: colegios } =
    colegioIds.length > 0 ? await admin.from("profiles").select("id, nombre").in("id", colegioIds) : { data: [] };
  const colegioNombreById = new Map((colegios ?? []).map((c) => [c.id, c.nombre]));

  const grupos: GrupoOption[] = (grupoRows ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    colegioNombre: g.colegio_id ? (colegioNombreById.get(g.colegio_id) ?? null) : null,
    tutorId: g.tutor_id,
  }));

  const { data: materias, error: materiasError } = await admin.from("materias").select("id, name").order("name");
  if (materiasError) console.error("Failed to load materias:", materiasError);

  const clases = await getClasesParaGrupos(admin, [], { soloTutorId: tutorId });

  return { clases, grupos, materias: materias ?? [] };
}

export default async function TutoresAgendaPage() {
  const profile = await getAuthenticatedProfile();
  const { clases, grupos, materias } = profile
    ? await getAgendaData(profile.id)
    : { clases: [], grupos: [], materias: [] };

  const { proximas, pasadas } = splitProximasPasadas(clases);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {grupos.length === 0
            ? "Todavía no tienes grupos asignados — pídele al administrador que te asigne uno."
            : `${grupos.length} grupo${grupos.length === 1 ? "" : "s"} asignado${grupos.length === 1 ? "" : "s"}.`}
        </p>
        {grupos.length > 0 ? (
          <ClaseFormDialog
            grupos={grupos}
            materias={materias}
            createAction={createClaseAction}
            updateAction={updateClaseAction}
            trigger={<Button size="sm">+ Programar clase</Button>}
          />
        ) : null}
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-base font-bold text-primary">Próximas clases</h2>
        {proximas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
              <CalendarClock className="mb-2 size-6" aria-hidden="true" />
              No tienes clases programadas todavía.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {proximas.map((clase) => (
              <Card key={clase.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{clase.nombre}</span>
                      <StatusBadge tone="info">{clase.materiaNombre}</StatusBadge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {clase.grupoNombre} · {formatScheduled(clase.scheduledAt)}
                      {clase.durationMinutes ? ` · ${clase.durationMinutes} min` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {clase.meetingLink ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={clase.meetingLink} target="_blank" rel="noreferrer" className="gap-1.5">
                          <ExternalLink className="size-3.5" /> Unirse
                        </a>
                      </Button>
                    ) : null}
                    <ClaseFormDialog
                      clase={clase}
                      grupos={grupos}
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {pasadas.length > 0 ? (
        <div>
          <h2 className="mb-3 text-base font-bold text-primary">Clases anteriores</h2>
          <div className="flex flex-col gap-2.5">
            {pasadas.map((clase) => (
              <Card key={clase.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{clase.nombre}</span>
                      <StatusBadge tone="neutral">{clase.materiaNombre}</StatusBadge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {clase.grupoNombre} · {formatScheduled(clase.scheduledAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {clase.recordingLink ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={clase.recordingLink} target="_blank" rel="noreferrer" className="gap-1.5">
                          <Video className="size-3.5" /> Ver grabación
                        </a>
                      </Button>
                    ) : null}
                    <ClaseFormDialog
                      clase={clase}
                      grupos={grupos}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <h3 className="mb-3 text-base font-bold text-primary">Accesos rápidos</h3>
      <QuickLinksRow
        links={[
          { href: "/tutores/materias", label: "Materias", icon: Layers },
          { href: "/tutores/estudiantes", label: "Estudiantes asignados", icon: GraduationCap },
          { href: "/tutores/actividades", label: "Actividades por calificar", icon: ClipboardList },
          { href: "/tutores/mensajes", label: "Mensajes", icon: Mail },
          { href: "/tutores/informes", label: "Informes", icon: FileText },
        ]}
      />
    </div>
  );
}
