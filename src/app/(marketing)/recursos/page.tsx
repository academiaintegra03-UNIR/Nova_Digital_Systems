import Image from "next/image";
import type { Metadata } from "next";
import { ResourceFilterList } from "@/features/recursos/resource-filter-list";

export const metadata: Metadata = { title: "Recursos educativos" };

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <div className="mb-9 grid grid-cols-1 items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl lg:order-2">
          <Image
            src="/images/people-studying.jpg"
            alt="Estudiantes revisando libros y material de estudio"
            fill
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="lg:order-1">
          <h1 className="mb-2 text-3xl font-extrabold text-heading">Recursos educativos</h1>
          <p className="text-base text-muted-foreground">
            Guías, videos y ejercicios gratuitos. Los materiales exclusivos se habilitan al matricularte.
          </p>
        </div>
      </div>
      <ResourceFilterList />
    </div>
  );
}
