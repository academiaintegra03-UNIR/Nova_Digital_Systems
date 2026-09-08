import { notFound } from "next/navigation";
import { ExternalLink, FileText, Link2, Trash2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/require-role";
import { getGrupoMateriaContextForTutor } from "@/lib/queries/grupo-materias";
import { getRecursosParaGrupoMateria } from "@/lib/queries/recursos";
import { createRecursoAction, deleteRecursoAction } from "@/app/tutores/materias/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateRecursoDialog } from "@/features/tutores/create-recurso-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";

export default async function TutorMateriaRecursosPage({
  params,
}: PageProps<"/tutores/materias/[grupoMateriaId]/recursos">) {
  const { grupoMateriaId } = await params;
  const profile = await requireRole("tutor");
  const admin = createAdminClient();
  const curso = await getGrupoMateriaContextForTutor(admin, grupoMateriaId, profile.id);
  if (!curso) notFound();

  const recursos = await getRecursosParaGrupoMateria(admin, curso.grupoId, curso.materiaId);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <CreateRecursoDialog grupoId={curso.grupoId} materiaId={curso.materiaId} createAction={createRecursoAction} />
      </div>

      {recursos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
            <FileText className="mb-2 size-6" aria-hidden="true" />
            Todavía no hay recursos para esta materia.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {recursos.map((recurso) => (
            <Card key={recurso.id}>
              <CardContent className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-2.5">
                  {recurso.tipo === "pdf" ? (
                    <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Link2 className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className="text-sm font-semibold text-foreground">{recurso.titulo}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon-sm" variant="ghost" asChild aria-label="Abrir recurso">
                    <a href={recurso.url} target="_blank" rel="noreferrer">
                      <ExternalLink />
                    </a>
                  </Button>
                  <ConfirmDeleteDialog
                    id={recurso.id}
                    title="Eliminar recurso"
                    description={`Esta acción elimina "${recurso.titulo}". No se puede deshacer.`}
                    successMessage="Recurso eliminado."
                    deleteAction={deleteRecursoAction}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Eliminar ${recurso.titulo}`}
                      >
                        <Trash2 />
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
