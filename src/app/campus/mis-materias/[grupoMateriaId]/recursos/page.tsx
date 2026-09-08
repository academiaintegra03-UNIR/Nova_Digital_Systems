import { notFound } from "next/navigation";
import { ExternalLink, FileText, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getGrupoMateriaContextForStudent } from "@/lib/queries/grupo-materias";
import { getRecursosParaGrupoMateria } from "@/lib/queries/recursos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function CampusMiMateriaRecursosPage({
  params,
}: PageProps<"/campus/mis-materias/[grupoMateriaId]/recursos">) {
  const { grupoMateriaId } = await params;
  const supabase = await createClient();
  const curso = await getGrupoMateriaContextForStudent(supabase, grupoMateriaId);
  if (!curso) notFound();

  const recursos = await getRecursosParaGrupoMateria(supabase, curso.grupoId, curso.materiaId);

  if (recursos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
          <FileText className="mb-2 size-6" aria-hidden="true" />
          Todavía no hay recursos para esta materia.
        </CardContent>
      </Card>
    );
  }

  return (
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
            <Button size="sm" variant="outline" asChild>
              <a href={recurso.url} target="_blank" rel="noreferrer" className="gap-1.5">
                <ExternalLink className="size-3.5" /> Abrir
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
