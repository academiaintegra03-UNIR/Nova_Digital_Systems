import Image from "next/image";
import Link from "next/link";
import { heroContent } from "@/lib/data/home-content";
import { Button } from "@/components/ui/button";
import { TryAQuestionCard } from "@/features/marketing/try-a-question-card";

// The headline highlights one word with a hand-drawn-style underline instead
// of a generic gradient/badge — "matemáticas" is the word being marked up.
const HIGHLIGHT_WORD = "matemáticas";

function Headline({ text }: { text: string }) {
  const idx = text.toLowerCase().indexOf(HIGHLIGHT_WORD);
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const word = text.slice(idx, idx + HIGHLIGHT_WORD.length);
  const after = text.slice(idx + HIGHLIGHT_WORD.length);
  return (
    <>
      {before}
      <span className="relative inline-block whitespace-nowrap">
        {word}
        <svg
          viewBox="0 0 200 14"
          preserveAspectRatio="none"
          className="absolute -bottom-1.5 left-0 h-2.5 w-full text-glacier"
          aria-hidden="true"
        >
          <path
            d="M2 9 C40 2, 80 12, 100 6 C130 -2, 165 11, 198 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {after}
    </>
  );
}

/**
 * Hero con fondo ilustrado (public/images/fondointerfaz*.png) sobre el tema
 * oscuro global. El texto y la tarjeta usan los tokens del tema, sin estilos
 * propios. La pregunta de la derecha se puede responder de verdad, no es una
 * captura.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border text-foreground">
      {/* Fondo ilustrado: una imagen por formato (art direction), ambas a sangre. La de
          escritorio conserva el arte a la derecha, detrás de la tarjeta; la móvil, abajo. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <Image
          src="/images/fondointerfaz.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-right md:block"
        />
        <Image
          src="/images/fondointerfazmovil.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom md:hidden"
        />
        {/* Degradados de marca: aseguran contraste del texto (arriba en móvil, a la izquierda en escritorio) y funden la
            imagen con el fondo oscuro de la página por abajo. */}
        <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/35 to-transparent md:bg-linear-to-r md:from-background/60 md:via-background/20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-8 sm:py-24 md:min-h-[34rem] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <div className="mb-5 flex items-center gap-2.5">
            <span className="h-px w-8 bg-secondary-foreground/60" aria-hidden="true" />
            <span className="text-xs font-bold tracking-wide text-secondary-foreground uppercase">
              {heroContent.eyebrow}
            </span>
          </div>
          <h1 className="mb-5 text-3xl leading-tight font-extrabold tracking-tight text-heading sm:text-4xl lg:text-5xl">
            <Headline text={heroContent.title} />
          </h1>
          <p className="mb-8 max-w-md text-base leading-relaxed text-foreground/75">{heroContent.subtitle}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" variant="cta" asChild>
              <Link href="/diagnostico">Realizar diagnóstico gratuito</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/programas">Explorar programas</Link>
            </Button>
          </div>
        </div>

        <div className="flex justify-center py-4 lg:justify-end lg:py-0">
          <TryAQuestionCard className="shadow-[0_0_70px_-18px_var(--glacier)]" />
        </div>
      </div>
    </section>
  );
}
