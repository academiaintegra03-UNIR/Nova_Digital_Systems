import Link from "next/link";
import { Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getGrupoMateriasParaGrupos } from "@/lib/queries/grupo-materias";
import { Card, CardContent } from "@/components/ui/card";

export default async function CampusMisMateriasPage() {
  const supabase = await createClient();

  // Sin filtro por grupo a propósito — la policy "Los estudiantes ven las
  // materias de sus grupos" (0016) ya limita esto, vía RLS, a las
  // materias de los grupos donde el estudiante actual participa.
  const grupoMaterias = await getGrupoMateriasParaGrupos(supabase, [], { confiarEnRLS: true });

  if (grupoMaterias.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <Layers className="mb-3 size-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="mb-1.5 text-lg font-extrabold text-primary">Todavía no tienes materias</h1>
          <p className="text-sm text-muted-foreground">
            Cuando tu tutor agregue materias a tu grupo, las vas a ver aquí con sus clases y actividades.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {grupoMaterias.map((gm) => (
        <Link key={gm.id} href={`/campus/mis-materias/${gm.id}`}>
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/40">
            <CardContent className="py-5">
              <div className="mb-1 text-xs text-muted-foreground">{gm.grupoNombre}</div>
              <div className="text-base font-bold text-primary">{gm.materiaNombre}</div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
