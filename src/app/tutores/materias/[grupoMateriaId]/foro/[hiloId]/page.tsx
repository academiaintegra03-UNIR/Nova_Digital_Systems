import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/require-role";
import { getGrupoMateriaContextForTutor } from "@/lib/queries/grupo-materias";
import { getMensajesParaHilo } from "@/lib/queries/foro";
import { createMensajeAction, deleteHiloAction, deleteMensajeAction } from "@/app/tutores/materias/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MensajeForm } from "@/components/shared/mensaje-form";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function TutorHiloPage({
  params,
}: PageProps<"/tutores/materias/[grupoMateriaId]/foro/[hiloId]">) {
  const { grupoMateriaId, hiloId } = await params;
  const profile = await requireRole("tutor");
  const admin = createAdminClient();
  const curso = await getGrupoMateriaContextForTutor(admin, grupoMateriaId, profile.id);
  if (!curso) notFound();

  const { data: hilo } = await admin.from("foro_hilos").select("titulo, tutor_id").eq("id", hiloId).single();
  if (!hilo || hilo.tutor_id !== profile.id) notFound();

  const mensajes = await getMensajesParaHilo(admin, hiloId);
  const foroBase = `/tutores/materias/${grupoMateriaId}/foro`;

  return (
    <div>
      <Link
        href={foroBase}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Foro
      </Link>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-primary">{hilo.titulo}</h2>
        <ConfirmDeleteDialog
          id={hiloId}
          title="Eliminar hilo"
          description="Esta acción elimina el hilo y todos sus mensajes. No se puede deshacer."
          successMessage="Hilo eliminado."
          deleteAction={deleteHiloAction}
          trigger={
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5">
              <Trash2 className="size-3.5" /> Eliminar hilo
            </Button>
          }
        />
      </div>

      <div className="mb-4 flex flex-col gap-3">
        {mensajes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay respuestas.</p>
        ) : (
          mensajes.map((mensaje) => (
            <Card key={mensaje.id}>
              <CardContent className="py-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground">{mensaje.autorNombre}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatFecha(mensaje.createdAt)}</span>
                    <ConfirmDeleteDialog
                      id={mensaje.id}
                      title="Eliminar mensaje"
                      description="Esta acción elimina el mensaje. No se puede deshacer."
                      successMessage="Mensaje eliminado."
                      deleteAction={deleteMensajeAction}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Eliminar mensaje"
                        >
                          <Trash2 />
                        </Button>
                      }
                    />
                  </div>
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
