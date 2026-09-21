import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { countries, countryOrder } from "@/lib/data/countries";
import { Button } from "@/components/ui/button";
import { siteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return countryOrder.map((id) => ({ pais: id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/paises/[pais]">): Promise<Metadata> {
  const { pais } = await params;
  const country = countries[pais as keyof typeof countries];
  return {
    title: country ? `Preparación ${country.exam}` : "Preparación por país",
    description: country?.description,
  };
}

export default async function CountryPage({ params }: PageProps<"/paises/[pais]">) {
  const { pais } = await params;
  const country = countries[pais as keyof typeof countries];
  if (!country) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Preparación por país", item: `${siteUrl}/paises` },
      { "@type": "ListItem", position: 3, name: country.name, item: `${siteUrl}/paises/${country.id}` },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="mb-2 text-3xl font-extrabold text-heading">Preparación para exámenes por país</h1>
      <p className="mb-7 text-base text-muted-foreground">
        Selecciona tu país para conocer la ruta de preparación diseñada para tu examen.
      </p>

      <div className="mb-8 flex gap-1 overflow-x-auto border-b border-border">
        {countryOrder.map((id) => {
          const c = countries[id];
          const active = id === country.id;
          return (
            <Link
              key={id}
              href={`/paises/${id}`}
              className={cn(
                "shrink-0 border-b-[3px] px-4 py-2.5 text-sm font-bold",
                active ? "border-primary text-heading" : "border-transparent text-muted-foreground"
              )}
            >
              {c.flag} {c.name}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="mb-1.5 text-xl font-extrabold text-heading">{country.exam}</h2>
          <p className="mb-5 text-sm leading-relaxed text-foreground/80">{country.description}</p>

          <h3 className="mb-2 text-base font-extrabold text-heading">¿A quién está dirigida?</h3>
          <p className="mb-4.5 text-sm text-foreground/80">{country.audience}</p>

          <h3 className="mb-2 text-base font-extrabold text-heading">Áreas evaluadas</h3>
          <div className="mb-4.5 flex flex-wrap gap-2">
            {country.areas.map((a) => (
              <span
                key={a}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
              >
                {a}
              </span>
            ))}
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3.5">
            <div className="rounded-[10px] border border-border bg-card p-3.5">
              <div className="text-xs text-muted-foreground">Modalidad</div>
              <div className="text-sm font-bold text-heading">{country.modality}</div>
            </div>
            <div className="rounded-[10px] border border-border bg-card p-3.5">
              <div className="text-xs text-muted-foreground">Duración</div>
              <div className="text-sm font-bold text-heading">{country.duration}</div>
            </div>
            <div className="rounded-[10px] border border-border bg-card p-3.5">
              <div className="text-xs text-muted-foreground">Simulacros disponibles</div>
              <div className="text-sm font-bold text-heading">{country.simulations}</div>
            </div>
            <div className="rounded-[10px] border border-border bg-card p-3.5">
              <div className="text-xs text-muted-foreground">Seguimiento</div>
              <div className="text-sm font-bold text-heading">{country.tracking}</div>
            </div>
          </div>

          <h3 className="mb-2.5 text-base font-extrabold text-heading">Preguntas frecuentes</h3>
          {country.faqs.map((f) => (
            <div key={f.q} className="border-b border-border py-2.5">
              <div className="text-sm font-bold text-heading">{f.q}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.a}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5.5">
            <div className="mb-2.5 text-sm text-muted-foreground">Planes disponibles</div>
            {country.plans.map((pl) => (
              <div key={pl} className="mb-1 text-sm font-bold text-heading">
                {pl}
              </div>
            ))}
            <div className="my-3.5 h-px bg-border" />
            <Button className="mb-2.5 w-full" asChild>
              <Link href="/planes-precios">Ver precios e inscripción</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/diagnostico">Hacer diagnóstico gratuito</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
