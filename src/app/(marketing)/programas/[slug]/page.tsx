import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getProgram, programs } from "@/lib/data/programs";
import { Button } from "@/components/ui/button";
import { siteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/programas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  return {
    title: program?.name ?? "Programa",
    description: program?.blurb,
  };
}

export default async function ProgramDetailPage({ params }: PageProps<"/programas/[slug]">) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.name,
    description: program.description,
    provider: { "@type": "EducationalOrganization", name: "Nova Digital Studio Systems", sameAs: siteUrl },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Programas", item: `${siteUrl}/programas` },
      { "@type": "ListItem", position: 3, name: program.name, item: `${siteUrl}/programas/${program.id}` },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Link href="/programas" className="text-sm font-bold text-secondary-foreground">
        ← Volver a programas
      </Link>
      <div className="mt-4.5 text-xs font-bold tracking-wide text-secondary-foreground uppercase">
        {program.level}
      </div>
      <h1 className="mt-1.5 mb-3 text-3xl font-extrabold text-heading">{program.name}</h1>
      <p className="mb-7 max-w-2xl text-base leading-relaxed text-foreground/80">{program.description}</p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <h3 className="mb-2.5 text-base font-extrabold text-heading">Temas del programa</h3>
          <div className="mb-6 flex flex-wrap gap-2">
            {program.topics.map((t) => (
              <span
                key={t}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
              >
                {t}
              </span>
            ))}
          </div>

          <h3 className="mb-2.5 text-base font-extrabold text-heading">Metodología</h3>
          <p className="mb-6 text-sm leading-relaxed text-foreground/80">{program.methodology}</p>

          <h3 className="mb-2.5 text-base font-extrabold text-heading">Qué incluye</h3>
          {program.includes.map((inc) => (
            <div key={inc} className="mb-2 flex items-start gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              <span className="text-sm text-foreground/80">{inc}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5.5">
            <div className="mb-1 text-sm text-muted-foreground">Modalidad</div>
            <div className="mb-3.5 text-sm font-bold text-heading">{program.modality}</div>
            <div className="mb-1 text-sm text-muted-foreground">Duración</div>
            <div className="mb-3.5 text-sm font-bold text-heading">{program.duration}</div>
            <div className="mb-1 text-sm text-muted-foreground">Tutor responsable</div>
            <div className="mb-5 text-sm font-bold text-heading">{program.tutor}</div>
            <Button className="mb-2.5 w-full" asChild>
              <Link href="/planes-precios">Ver planes e inscripción</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/diagnostico">Hacer diagnóstico antes</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
