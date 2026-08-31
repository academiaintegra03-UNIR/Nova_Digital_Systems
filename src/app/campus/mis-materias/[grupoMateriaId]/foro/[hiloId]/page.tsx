import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getGrupoMateriaContextForStudent } from "@/lib/queries/grupo-materias";
import { getMensajesParaHilo } from "@/lib/queries/foro";
import { createMensajeAction } from "@/app/campus/mis-materias/actions";
import { Card, CardContent } from "@/components/ui/card";
import { MensajeForm } from "@/components/shared/mensaje-form";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function CampusHiloPage({
  params,
}: PageProps<"/campus/mis-materias/[grupoMateriaId]/foro/[hiloId]">) {
  const { grupoMateriaId, hiloId } = await params;
  const supabase = await createClient();
  const curso = await getGrupoMateriaContextForStudent(supabase, grupoMateriaId);
  if (!curso) notFound();

  const { data: hilo } = await supabase.from("foro_hilos").select("titulo").eq("id", hiloId).maybeSingle();
  if (!hilo) notFound();

  const mensajes = await getMensajesParaHilo(supabase, hiloId);
  const foroBase = `/campus/mis-materias/${grupoMateriaId}/foro`;

  return (
    <div>
      <Link
        href={foroBase}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Foro
      </Link>

      <h2 className="mb-4 text-lg font-extrabold text-primary">{hilo.titulo}</h2>

      <div className="mb-4 flex flex-col gap-3">
        {mensajes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay respuestas.</p>
        ) : (
          mensajes.map((mensaje) => (
            <Card key={mensaje.id}>
              <CardContent className="py-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground">{mensaje.autorNombre}</span>
                  <span className="text-xs text-muted-foreground">{formatFecha(mensaje.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground/90">{mensaje.mensaje}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <MensajeForm hiloId={hiloId} createAction={createMensajeAction} />
    </div>
  );
}
