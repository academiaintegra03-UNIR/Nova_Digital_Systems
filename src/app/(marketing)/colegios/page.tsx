import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { methodologyPoints, schoolServices } from "@/lib/data/home-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Metodología y servicios para colegios" };

export default function SchoolsMethodologyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <div className="mb-11 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="mb-3 text-3xl font-extrabold text-heading">Metodología y servicios para colegios</h1>
          <p className="max-w-2xl text-base leading-relaxed text-foreground/80">
            Combinamos acompañamiento humano con herramientas de práctica y seguimiento, en grupos pequeños
            que permiten atención real a cada estudiante.
          </p>
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
          <Image
            src="/images/group-study.jpg"
            alt="Grupo de estudiantes revisando material de estudio juntos"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="mb-11 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {methodologyPoints.map((m) => (
          <Card key={m.title}>
            <CardContent className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <m.icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <div className="mb-1 text-base font-bold text-heading">{m.title}</div>
                <div className="text-sm leading-relaxed text-muted-foreground">{m.desc}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mb-4 text-xl font-extrabold text-heading">Para colegios e instituciones</h2>
      <div className="mb-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {schoolServices.map((s) => (
          <div key={s} className="flex items-start gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            <span className="text-sm text-foreground/80">{s}</span>
          </div>
        ))}
      </div>
      <Button asChild>
        <Link href="/contacto">Hablar sobre un plan institucional</Link>
      </Button>
    </div>
  );
}
