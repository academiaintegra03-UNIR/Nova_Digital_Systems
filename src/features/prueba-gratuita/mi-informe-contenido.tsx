import Link from "next/link";
import { Lock } from "lucide-react";
import type { Profile } from "@/lib/types/session";
import { getEstadoPrueba } from "@/lib/prueba-gratuita/estado";
import { construirInforme } from "@/lib/prueba-gratuita/informe";
import { InformePrueba } from "@/features/prueba-gratuita/informe-prueba";
import { DescargarInformeButton } from "@/features/prueba-gratuita/descargar-informe-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/** Informe guardado de la prueba gratuita dentro del panel del
 * estudiante: lo muestra /campus/mi-informe y, para una cuenta de prueba
 * que ya terminó, campus/layout.tsx en lugar de cualquier otra página. */
export async function MiInformeContenido({ profile }: { profile: Profile }) {
  const estado = await getEstadoPrueba(profile.id);

  if (!estado.finalizada) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-10 text-center text-sm text-foreground/80">
          Todavía no tienes un informe de la prueba gratuita.
        </CardContent>
      </Card>
    );
  }

  const { data, resultados } = construirInforme(profile.nombre, estado);

  return (
    <div className="-mx-4 sm:-mx-8">
      <InformePrueba data={data} resultados={resultados} acciones={<DescargarInformeButton data={data} />} />
      <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <Lock className="size-8 text-glacier-strong" aria-hidden="true" />
            <h2 className="text-lg font-bold text-heading">¿Quieres seguir avanzando?</h2>
            <p className="max-w-md text-sm leading-relaxed text-foreground/80">
              Tu prueba gratuita ya terminó. Con un plan desbloqueas tus materias, simulacros, banco de preguntas y el
              tutor con IA.
            </p>
            <Button asChild size="lg" variant="cta" className="mt-1">
              <Link href="/planes-precios">Ver planes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
