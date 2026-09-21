import Image from "next/image";
import type { Metadata } from "next";
import { ProgramFilterList } from "@/features/programas/program-filter-list";

export const metadata: Metadata = { title: "Programas académicos" };

export default function ProgramsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <div className="mb-9 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h1 className="mb-2 text-3xl font-extrabold text-heading">Programas académicos</h1>
          <p className="text-base text-muted-foreground">
            Desde fundamentos de primaria hasta cálculo universitario y preparación para exámenes.
          </p>
        </div>
        <div className="relative hidden aspect-3/4 overflow-hidden rounded-2xl sm:block">
          <Image
            src="/images/student-laptop-classroom.jpg"
            alt="Estudiante estudiando con su portátil en un salón iluminado"
            fill
            sizes="(min-width: 1024px) 30vw, 40vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
      <ProgramFilterList />
    </div>
  );
}
