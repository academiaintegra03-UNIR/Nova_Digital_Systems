import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { BarChart3, BookOpen, Search } from "lucide-react";
import {
  filtrarColegios,
  getDepartamentos,
  getMunicipios,
  leerFiltros,
  num,
  resumenGeneral,
} from "@/lib/saber11/data";
import { Cifra, hrefCon } from "@/features/saber11/componentes";
import { FiltrosColegios } from "@/features/saber11/filtros-colegios";
import { TablaColegios } from "@/features/saber11/tabla-colegios";
import { EstadisticasColegios } from "@/features/saber11/estadisticas-colegios";
import { Metodologia } from "@/features/saber11/metodologia";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Resultados Saber 11 por colegio",
  description:
    "Explora los resultados Saber 11 de los colegios de Colombia: rankings, categorías ICFES (Resolución 677 de 2021), estadísticas nacionales y fichas por colegio. Cohortes 2024-2026.",
};

const BASE = "/alianza-colegios";

const VISTAS = [
  { id: "explorar", label: "Explorador y rankings", icon: Search },
  { id: "estadisticas", label: "Estadísticas", icon: BarChart3 },
  { id: "metodologia", label: "Guía metodológica", icon: BookOpen },
] as const;

type Vista = (typeof VISTAS)[number]["id"];

export default async function AlianzaColegiosPage({ searchParams }: PageProps<"/alianza-colegios">) {
  const params = await searchParams;
  const vistaParam = Array.isArray(params.vista) ? params.vista[0] : params.vista;
  const vista: Vista = VISTAS.some((v) => v.id === vistaParam) ? (vistaParam as Vista) : "explorar";

  const filtros = leerFiltros(params);
  const resumen = resumenGeneral();
  const hayFiltros = Boolean(
    filtros.q || filtros.dep || filtros.mun || filtros.sector || filtros.cal || filtros.cat || filtros.top
  );
  const lista = vista === "metodologia" ? [] : filtrarColegios(filtros);

  const partes = [filtros.dep, filtros.mun, filtros.sector && `Sector ${filtros.sector.toLowerCase()}`].filter(Boolean);
  const contexto = `${partes.length ? partes.join(" · ") : "Colombia completa"} · ${
    filtros.anio === "tri" ? "trienal 2024-2026" : filtros.anio
  }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      {/* Encabezado */}
      <div className="text-xs font-bold tracking-wide text-secondary-foreground uppercase">
        Analítica Saber 11 · Colombia
      </div>
      <h1 className="mt-1.5 mb-3 text-3xl font-extrabold text-heading sm:text-4xl">
        Resultados Saber 11 de los colegios de Colombia
      </h1>
      <p className="mb-5 max-w-3xl text-base leading-relaxed text-foreground/80">
        Consulta el puntaje, el puesto y la categoría ICFES de cada colegio, compara por departamento, municipio y
        sector, y revisa su evolución en los últimos tres años.
      </p>
      <div className="mb-8 flex flex-wrap gap-2">
        {["Clasificación trienal · Res. 677 de 2021", "Corte PRISMA 2026", "Cohortes 2024-2026"].map((d) => (
          <span key={d} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
            {d}
          </span>
        ))}
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Cifra titulo="Colegios 2026" valor={num(resumen.total2026)} detalle="Sedes con 5 o más evaluados" />
        <Cifra titulo="Colegios 2025" valor={num(resumen.total2025)} detalle="Con resultados ese año" />
        <Cifra titulo="Colegios 2024 (A + B)" valor={num(resumen.total2024)} detalle="Con resultados ese año" />
        <Cifra
          titulo="Cobertura"
          valor={`${num(resumen.departamentos)} / ${num(resumen.municipios)}`}
          detalle="Departamentos / municipios"
        />
      </div>

      {/* Pestañas: enlaces, para que cada vista tenga su URL y se conserven los filtros. */}
      <nav aria-label="Secciones" className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {VISTAS.map((v) => {
          const activa = v.id === vista;
          return (
            <Link
              key={v.id}
              href={hrefCon(BASE, params, { vista: v.id === "explorar" ? null : v.id, pagina: null })}
              scroll={false}
              aria-current={activa ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors",
                activa
                  ? "border-glacier text-heading"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <v.icon className="size-4" aria-hidden="true" />
              {v.label}
            </Link>
          );
        })}
      </nav>

      {vista !== "metodologia" ? (
        <div className="mb-6">
          <Suspense>
            <FiltrosColegios departamentos={getDepartamentos()} municipios={getMunicipios(filtros.dep)} />
          </Suspense>
        </div>
      ) : null}

      {vista === "explorar" ? (
        <>
          <p className="mb-3 text-xs text-muted-foreground">
            {contexto}. <em>Promedio simple</em> = suma de las 5 materias / 5; <em>promedio ponderado</em> = pesos
            3-3-3-3-1 / 13 (oficial ICFES). Toca un colegio para ver su ficha.
          </p>
          <TablaColegios lista={lista} filtros={filtros} params={params} hayFiltros={hayFiltros} />
        </>
      ) : vista === "estadisticas" ? (
        <EstadisticasColegios lista={lista} filtros={filtros} contexto={contexto} />
      ) : (
        <Metodologia />
      )}
    </div>
  );
}
