import { getImageProps } from "next/image";
import Link from "next/link";
import { heroContent } from "@/lib/data/home-content";
import { Button } from "@/components/ui/button";

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

// Art direction con <picture>: el navegador elige y descarga una sola imagen según
// el ancho. Con dos <Image fill> ocultos por CSS se bajaban ambas y Next avisaba
// que la oculta (ancho 0) no se renderizaba a "100vw".
function HeroBackground() {
  // quality 90 (habilitada en next.config): con el 75 por defecto la foto se veía borrosa.
  const common = { alt: "", fill: true, priority: true, sizes: "100vw", quality: 90 } as const;
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: "/images/imagenprincipal.png" });
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({ ...common, src: "/images/imagenprincipalmovil.png" });

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop} />
      <source srcSet={mobile} />
      {/* Móvil: abajo, donde están los estudiantes (el cielo de arriba queda para el texto).
          Escritorio: la franja de las caras y la mesa. */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...rest} className="object-cover object-bottom md:object-[center_45%]" />
    </picture>
  );
}

/**
 * Hero con foto de fondo (public/images/imagenprincipal.png en escritorio,
 * imagenprincipalmovil.png en móvil) sobre el tema
 * oscuro global. El texto usa los tokens del tema, sin estilos propios; la
 * mitad derecha queda libre para que se vea la foto.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border text-foreground">
      {/* Fondo ilustrado: una imagen por formato (art direction), ambas a sangre. La de
          escritorio conserva el arte a la derecha, detrás de la tarjeta; la móvil, abajo. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <HeroBackground />
        {/* Degradados de marca: aseguran contraste del texto (arriba en móvil, a la izquierda en escritorio) y funden la
            imagen con el fondo oscuro de la página por abajo. */}
        <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/35 to-transparent md:bg-linear-to-r md:from-background/90 md:via-background/40 md:to-transparent" />
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
      </div>
    </section>
  );
}
