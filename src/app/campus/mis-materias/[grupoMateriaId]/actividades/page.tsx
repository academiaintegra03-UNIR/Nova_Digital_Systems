import { notFound } from "next/navigation";
import { ClipboardList, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getGrupoMateriaContextForStudent } from "@/lib/queries/grupo-materias";
import { getActividadesParaGrupoMateria, getMisEntregas } from "@/lib/queries/actividades";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EntregarActividadDialog } from "@/features/campus/entregar-actividad-dialog";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function CampusMiMateriaActividadesPage({
  params,
}: PageProps<"/campus/mis-materias/[grupoMateriaId]/actividades">) {
  const { grupoMateriaId } = await params;
  const supabase = await createClient();
  const curso = await getGrupoMateriaContextForStudent(supabase, grupoMateriaId);
  if (!curso) notFound();

  const actividades = await getActividadesParaGrupoMateria(supabase, curso.grupoId, curso.materiaId);
  const misEntregas = await getMisEntregas(
    supabase,
    actividades.map((a) => a.id)
  );

  if (actividades.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
          <ClipboardList className="mb-2 size-6" aria-hidden="true" />
          Todavía no hay actividades para esta materia.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {actividades.map((actividad) => {
        const entrega = misEntregas.get(actividad.id);
        const entregada = entrega?.estado === "entregada";
        return (
          <Card key={actividad.id}>
            <CardContent className="py-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  {actividad.fechaLimite ? (
                    <div className="text-xs font-semibold text-muted-foreground">
                      Fecha de entrega: {formatFecha(actividad.fechaLimite)}
                    </div>
                  ) : null}
                  <div className="text-sm font-bold text-foreground">{actividad.titulo}</div>
                </div>
                <StatusBadge tone={entregada ? "success" : "warning"}>{entregada ? "Entregada" : "No entregada"}</StatusBadge>
              </div>
              {actividad.descripcion ? <p className="mb-3 text-xs text-muted-foreground">{actividad.descripcion}</p> : null}
              {entregada && entrega?.entregadoAt ? (
                <p className="mb-3 text-xs text-muted-foreground">Entregada el {formatFecha(entrega.entregadoAt)}</p>
              ) : null}
              <div className="flex items-center gap-2">
                {actividad.recursoLink ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={actividad.recursoLink} target="_blank" rel="noreferrer" className="gap-1.5">
                      <ExternalLink className="size-3.5" /> Recurso
                    </a>
                  </Button>
                ) : null}
                {!entregada ? <EntregarActividadDialog actividadId={actividad.id} titulo={actividad.titulo} /> : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
