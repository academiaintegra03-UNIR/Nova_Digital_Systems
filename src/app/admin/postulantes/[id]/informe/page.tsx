import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEstadoPrueba } from "@/lib/prueba-gratuita/estado";
import { construirInforme } from "@/lib/prueba-gratuita/informe";
import { InformePrueba } from "@/features/prueba-gratuita/informe-prueba";
import { DescargarInformeButton } from "@/features/prueba-gratuita/descargar-informe-button";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Informe de prueba gratuita" };

/** Informe guardado de un postulante, visto por el admin: el mismo que ve
 * el estudiante, más el comentario pedagógico de cada respuesta. El
 * layout de /admin ya exige rol administrador. */
export default async function AdminInformePostulantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: postulante } = await admin
    .from("postulaciones_prueba_gratuita")
    .select("nombre, profile_id")
    .eq("id", id)
    .maybeSingle();
  if (!postulante?.profile_id) notFound();

  const estado = await getEstadoPrueba(postulante.profile_id);
  if (!Object.keys(estado.respuestas).length) notFound();

  const { data, resultados } = construirInforme(postulante.nombre, estado);

  return (
    <div className="-mx-4 sm:-mx-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/postulantes">
            <ArrowLeft aria-hidden="true" /> Volver a postulantes
          </Link>
        </Button>
        {!estado.finalizada ? (
          <p className="mt-3 rounded-lg bg-muted px-4 py-3 text-sm text-foreground/85">
            Este estudiante todavía no termina la prueba: el informe muestra solo las materias que ya envió.
          </p>
        ) : null}
      </div>
      <InformePrueba data={data} resultados={resultados} acciones={<DescargarInformeButton data={data} />} vistaDocente />
    </div>
  );
}
