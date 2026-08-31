import { CalendarClock, ExternalLink, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClasesParaGrupos } from "@/lib/queries/clases";
import { splitProximasPasadas } from "@/lib/clases";
import type { ClaseRow } from "@/lib/types/panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";

function formatScheduled(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getMisClases(): Promise<ClaseRow[]> {
  const supabase = await createClient();

  // Sin filtro por grupo a propósito — la policy "Los estudiantes ven las
  // clases de sus grupos" (0015) ya limita esto, vía RLS, a las clases de
  // los grupos donde el estudiante actual participa.
  return getClasesParaGrupos(supabase, [], { confiarEnRLS: true });
}

export default async function CampusMisClasesPage() {
  const clases = await getMisClases();

  const { proximas, pasadas } = splitProximasPasadas(clases);

  if (clases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <CalendarClock className="mb-3 size-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="mb-1.5 text-lg font-extrabold text-primary">Todavía no tienes clases</h1>
          <p className="text-sm text-muted-foreground">
            Cuando tu tutor programe una clase para tu grupo, la vas a ver aquí con el link para unirte.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-3 text-base font-bold text-primary">Próximas clases</h2>
        {proximas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tienes clases próximas por ahora.</p>
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
                      {clase.tutorNombre ? ` · ${clase.tutorNombre}` : ""}
                    </div>
                  </div>
                  {clase.meetingLink ? (
                    <Button size="sm" asChild>
                      <a href={clase.meetingLink} target="_blank" rel="noreferrer" className="gap-1.5">
                        <ExternalLink className="size-3.5" /> Unirse
                      </a>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Link pendiente</span>
                  )}
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
                  {clase.recordingLink ? (
                    <Button size="sm" variant="outline" asChild>
                      <a href={clase.recordingLink} target="_blank" rel="noreferrer" className="gap-1.5">
                        <Video className="size-3.5" /> Ver grabación
                      </a>
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
