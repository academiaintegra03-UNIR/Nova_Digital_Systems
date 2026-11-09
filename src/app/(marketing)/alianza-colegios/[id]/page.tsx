import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getColegio } from "@/lib/saber11/data";
import { FichaColegio } from "@/features/saber11/ficha-colegio";

export async function generateMetadata({ params }: PageProps<"/alianza-colegios/[id]">): Promise<Metadata> {
  const { id } = await params;
  const c = getColegio(id);
  if (!c) return { title: "Colegio no encontrado" };
  return {
    title: `${c.n} — Resultados Saber 11`,
    description: `Puntaje Saber 11, puesto y categoría ICFES de ${c.n} (${c.m}, ${c.d}). Evolución 2024-2026.`,
  };
}

export default async function ColegioPage({ params }: PageProps<"/alianza-colegios/[id]">) {
  const { id } = await params;
  const c = getColegio(id);
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <Link href="/alianza-colegios" className="text-sm font-bold text-secondary-foreground">
        ← Volver a los resultados
      </Link>

      <div className="mt-4.5 text-xs font-bold tracking-wide text-secondary-foreground uppercase">
        Ficha institucional Saber 11
      </div>
      <h1 className="mt-1.5 mb-2 text-3xl font-extrabold text-heading sm:text-4xl">{c.n}</h1>
      <p className="mb-4 text-base text-foreground/80">
        {c.m}, {c.d} · Código DANE {c.id}
      </p>
      <FichaColegio c={c} />
    </div>
  );
}
