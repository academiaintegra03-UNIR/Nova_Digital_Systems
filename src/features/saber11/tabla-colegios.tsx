import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fronteraDe, num, type ColegioFiltrado, type Filtros, type Orden } from "@/lib/saber11/data";
import { CategoriaBadge, hrefCon } from "@/features/saber11/componentes";
import { VerFichaButton } from "@/features/saber11/ver-ficha-button";
import { cn } from "@/lib/utils";

const POR_PAGINA = 50;
const BASE = "/alianza-colegios";

type Params = Record<string, string | string[] | undefined>;

const COLUMNAS: { id: Orden | null; label: string; className?: string; ascPorDefecto?: boolean }[] = [
  { id: "puesto", label: "Puesto", ascPorDefecto: true },
  { id: "nombre", label: "Institución", ascPorDefecto: true },
  { id: "ubicacion", label: "Ubicación", className: "hidden md:table-cell", ascPorDefecto: true },
  { id: null, label: "Sector · Cal.", className: "hidden lg:table-cell" },
  { id: "ev", label: "Eval.", className: "hidden sm:table-cell text-right" },
  { id: "g", label: "Global (0-500)", className: "text-right" },
  { id: "simp", label: "Prom. simple", className: "hidden xl:table-cell text-right" },
  { id: "pond", label: "Prom. ponderado", className: "hidden sm:table-cell text-right" },
  { id: "pg", label: "Percentil", className: "hidden lg:table-cell text-right" },
  { id: null, label: "Categoría" },
  { id: null, label: "Acción", className: "text-right" },
];

export function TablaColegios({
  lista,
  filtros,
  params,
  hayFiltros,
}: {
  lista: ColegioFiltrado[];
  filtros: Filtros;
  params: Params;
  hayFiltros: boolean;
}) {
  const total = lista.length;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const pagina = Math.min(filtros.pagina, paginas);
  const inicio = (pagina - 1) * POR_PAGINA;
  const filas = lista.slice(inicio, inicio + POR_PAGINA);
  const etiquetaAnio = filtros.anio === "tri" ? "trienal 2024-2026" : filtros.anio;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Colegios con resultados Saber 11 {etiquetaAnio}, ordenados por {filtros.orden}
          </caption>
          <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              {COLUMNAS.map((col) => {
                const activa = col.id === filtros.orden;
                const asc = activa ? !filtros.asc : !!col.ascPorDefecto;
                return (
                  <th
                    key={col.label}
                    scope="col"
                    aria-sort={activa ? (filtros.asc ? "ascending" : "descending") : undefined}
                    className={cn("px-3 py-2.5 font-semibold whitespace-nowrap", col.className)}
                  >
                    {col.id ? (
                      <Link
                        href={hrefCon(BASE, params, { orden: col.id, dir: asc ? "asc" : null, pagina: null })}
                        scroll={false}
                        className={cn(
                          "inline-flex items-center gap-1 hover:text-foreground",
                          activa && "text-heading"
                        )}
                      >
                        {col.label}
                        {activa ? (
                          filtros.asc ? (
                            <ArrowUp className="size-3" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="size-3" aria-hidden="true" />
                          )
                        ) : null}
                      </Link>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={COLUMNAS.length} className="px-3 py-10 text-center text-muted-foreground">
                  No hay colegios con estos filtros para {etiquetaAnio}.
                </td>
              </tr>
            ) : (
              filas.map(({ colegio: c, vista: v, puestoFiltro }) => {
                const frontera = fronteraDe(c);
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2.5 align-top whitespace-nowrap">
                      <div className="font-bold text-heading tabular-nums">#{hayFiltros ? puestoFiltro : num(v.pn)}</div>
                      {hayFiltros ? (
                        <div className="text-xs text-muted-foreground tabular-nums">Nal. #{num(v.pn)}</div>
                      ) : null}
                    </td>
                    <td className="max-w-72 px-3 py-2.5 align-top">
                      <Link
                        href={`${BASE}/${c.id}`}
                        className="font-semibold text-heading underline-offset-4 hover:underline"
                      >
                        {c.n}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        <span className="md:hidden">
                          {c.m}, {c.d} ·{" "}
                        </span>
                        DANE {c.id}
                      </div>
                    </td>
                    <td className="hidden px-3 py-2.5 align-top text-foreground/80 md:table-cell">
                      {c.m}, {c.d}
                    </td>
                    <td className="hidden px-3 py-2.5 align-top whitespace-nowrap text-foreground/80 lg:table-cell">
                      {c.s} · {c.c}
                    </td>
                    <td className="hidden px-3 py-2.5 text-right align-top tabular-nums sm:table-cell">{num(v.ev)}</td>
                    <td className="px-3 py-2.5 text-right align-top font-semibold text-heading tabular-nums">{num(v.g)}</td>
                    <td className="hidden px-3 py-2.5 text-right align-top tabular-nums xl:table-cell">{num(v.simp, 1)}</td>
                    <td className="hidden px-3 py-2.5 text-right align-top tabular-nums sm:table-cell">{num(v.pond, 3)}</td>
                    <td className="hidden px-3 py-2.5 text-right align-top tabular-nums lg:table-cell">
                      {v.pg == null ? "—" : `${num(v.pg, 1)}%`}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <div className="flex flex-wrap items-center gap-1">
                        <CategoriaBadge cat={v.cat} />
                        {frontera ? (
                          <span
                            title={`Zona frontera: posible ascenso a ${frontera.asciendeA}`}
                            className="inline-flex items-center gap-0.5 rounded-full bg-warning-foreground px-2 py-1 text-xs font-bold text-warning"
                          >
                            <Zap className="size-3" aria-hidden="true" />
                            <span className="sr-only">Zona frontera: posible ascenso a</span> {frontera.asciendeA}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right align-top">
                      <VerFichaButton id={c.id} nombre={c.n} ubicacion={`${c.m}, ${c.d}`} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <nav
        aria-label="Paginación"
        className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm sm:flex-row"
      >
        <p className="text-muted-foreground">
          {total === 0
            ? "0 colegios"
            : `Mostrando ${num(inicio + 1)}–${num(inicio + filas.length)} de ${num(total)} colegios`}
        </p>
        {paginas > 1 ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild={pagina > 1} disabled={pagina <= 1}>
              {pagina > 1 ? (
                <Link href={hrefCon(BASE, params, { pagina: String(pagina - 1) })} scroll={false}>
                  <ChevronLeft aria-hidden="true" /> Anterior
                </Link>
              ) : (
                <span>
                  <ChevronLeft aria-hidden="true" /> Anterior
                </span>
              )}
            </Button>
            <span className="text-muted-foreground tabular-nums">
              {pagina} / {paginas}
            </span>
            <Button variant="outline" size="sm" asChild={pagina < paginas} disabled={pagina >= paginas}>
              {pagina < paginas ? (
                <Link href={hrefCon(BASE, params, { pagina: String(pagina + 1) })} scroll={false}>
                  Siguiente <ChevronRight aria-hidden="true" />
                </Link>
              ) : (
                <span>
                  Siguiente <ChevronRight aria-hidden="true" />
                </span>
              )}
            </Button>
          </div>
        ) : null}
      </nav>
    </div>
  );
}
