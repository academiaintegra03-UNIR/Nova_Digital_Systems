import type { Metadata } from "next";
import Link from "next/link";
import { Hourglass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Prueba gratuita" };

/**
 * Página a la que apunta el correo de acceso de /admin/postulantes
 * (src/lib/email/send-postulacion-emails.ts). La cuenta del estudiante ya
 * existe para cuando llegue aquí — lo único que falta es la prueba en sí,
 * que todavía no se lanzó. Reemplazar este placeholder por el contenido
 * real de la prueba cuando esté listo, sin tocar el link del correo.
 */
export default function PruebaGratuitaPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-8">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <Hourglass className="size-10 text-glacier-strong" aria-hidden="true" />
          <h1 className="text-2xl font-extrabold text-heading">Todavía no está disponible</h1>
          <p className="text-sm leading-relaxed text-foreground/80">
            Tu cuenta ya está lista, pero estamos terminando de preparar la prueba gratuita. En cuanto se habilite te
            avisamos al correo con el que te postulaste.
          </p>
          <Button asChild size="lg" className="mt-2">
            <Link href="/login">Iniciar sesión mientras tanto</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
