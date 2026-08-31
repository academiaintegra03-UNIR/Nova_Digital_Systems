import Link from "next/link";
import { notFound } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getGrupoMateriaContextForStudent } from "@/lib/queries/grupo-materias";
import { getHilosParaGrupoMateria } from "@/lib/queries/foro";
import { createHiloAction } from "@/app/campus/mis-materias/actions";
import { Card, CardContent } from "@/components/ui/card";
import { CreateHiloDialog } from "@/components/shared/create-hilo-dialog";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function CampusMiMateriaForoPage({
  params,
}: PageProps<"/campus/mis-materias/[grupoMateriaId]/foro">) {
  const { grupoMateriaId } = await params;
  const supabase = await createClient();
  const curso = await getGrupoMateriaContextForStudent(supabase, grupoMateriaId);
  if (!curso) notFound();

  const hilos = await getHilosParaGrupoMateria(supabase, curso.grupoId, curso.materiaId);
  const base = `/campus/mis-materias/${grupoMateriaId}/foro`;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <CreateHiloDialog grupoId={curso.grupoId} materiaId={curso.materiaId} createAction={createHiloAction} hiloBasePath={base} />
      </div>

      {hilos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
            <MessagesSquare className="mb-2 size-6" aria-hidden="true" />
            Todavía no hay hilos — pregúntale a tu tutor aquí.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {hilos.map((hilo) => (
            <Link key={hilo.id} href={`${base}/${hilo.id}`}>
              <Card className="transition-colors hover:border-primary/40 hover:bg-muted/40">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{hilo.titulo}</div>
                    <div className="text-xs text-muted-foreground">{hilo.autorNombre}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>
                      {hilo.mensajesCount} mensaje{hilo.mensajesCount === 1 ? "" : "s"}
                    </div>
                    <div>{formatFecha(hilo.ultimaActividad)}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
