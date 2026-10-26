import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Mail } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { getEstadoPrueba, materiasPendientes } from "@/lib/prueba-gratuita/estado";
import { construirInforme } from "@/lib/prueba-gratuita/informe";
import { InformePrueba } from "@/features/prueba-gratuita/informe-prueba";
import { DescargarInformeButton } from "@/features/prueba-gratuita/descargar-informe-button";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Informe de tu prueba gratuita" };

/** Pantalla a la que llega el estudiante al enviar la última materia. El
 * mismo informe queda disponible en su panel (/campus/mi-informe). */
export default async function InformePruebaGratuitaPage() {
  const profile = await requireRole("estudiante");
  const estado = await getEstadoPrueba(profile.id);
  if (!estado.finalizada && materiasPendientes(profile.id, estado.respuestas).length > 0) redirect("/prueba-gratuita");

  const { data, resultados } = construirInforme(profile.nombre, estado);

  return (
    <>
      <div className="mx-auto mt-6 max-w-3xl px-4 sm:px-8">
        <p className="flex items-start gap-2.5 rounded-lg bg-muted px-4 py-3 text-sm text-foreground/85" role="status">
          <Mail className="mt-0.5 size-4 shrink-0 text-glacier-strong" aria-hidden="true" />
          ¡Terminaste! También te enviamos este informe en PDF a tu correo, y queda guardado en tu panel para que lo
          revises cuando quieras.
        </p>
      </div>
      <InformePrueba
        data={data}
        resultados={resultados}
        acciones={
          <>
            <Button asChild size="lg">
              <Link href="/campus/mi-informe">
                <LayoutDashboard aria-hidden="true" /> Ir a mi panel
              </Link>
            </Button>
            <DescargarInformeButton data={data} />
            <Button asChild size="lg" variant="cta">
              <Link href="/planes-precios">Ver planes</Link>
            </Button>
          </>
        }
      />
    </>
  );
}
