import type { Metadata } from "next";
import { siteName } from "@/lib/data/home-content";
import { PendingBadge } from "@/components/shared/pending-badge";

export const metadata: Metadata = { title: "Nosotros" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="mb-5 text-3xl font-extrabold text-heading">Nosotros</h1>
      <p className="mb-5 text-base leading-relaxed text-foreground/80">
        {siteName} nace de la unión de nuestra experiencia enseñando matemáticas y preparando estudiantes
        para exámenes de admisión en Colombia y otros países de la región. Creemos que razonar bien
        importa más que memorizar, y que la tecnología debe acompañar el aprendizaje, no reemplazar al
        tutor humano.
      </p>
      <p className="mb-8 text-base leading-relaxed text-foreground/80">
        No garantizamos puntajes ni admisiones: nuestro compromiso es ofrecer una ruta de estudio clara,
        seguimiento honesto y acompañamiento real para cada estudiante y su familia.
      </p>
      <div className="rounded-2xl bg-accent p-5">
        <p className="mb-3 text-sm text-foreground/80">
          Historia del equipo, fotografías y credenciales.
        </p>
        <PendingBadge />
      </div>
    </div>
  );
}
