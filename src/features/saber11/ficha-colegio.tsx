import { Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MATERIAS, MEDIA_NACIONAL_2026, fronteraDe, num, type Colegio } from "@/lib/saber11/utils";
import { Barra, CategoriaBadge, Cifra } from "@/features/saber11/componentes";
import { RadarCompetencias } from "@/features/saber11/radar-competencias";

function Historial({ c }: { c: Colegio }) {
  const filas = [
    { anio: "2026", y: c.y26 },
    { anio: "2025", y: c.y25 },
    { anio: "2024", y: c.y24 },
  ];
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">Evolución de resultados 2024 a 2026</caption>
        <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            {["Año", "Evaluados", "Global (0-500)", "Prom. simple", "Prom. ponderado", "Puesto nal.", "Categoría"].map(
              (h, i) => (
                <th key={h} scope="col" className={`px-3 py-2.5 font-semibold whitespace-nowrap ${i ? "text-right" : ""}`}>
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {filas.map(({ anio, y }) => (
            <tr key={anio} className="border-b border-border">
              <th scope="row" className="px-3 py-2.5 text-left font-bold text-heading">
                {anio}
              </th>
              <td className="px-3 py-2.5 text-right tabular-nums">{num(y?.ev)}</td>
              <td className="px-3 py-2.5 text-right font-semibold text-heading tabular-nums">{num(y?.g)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{num(y?.simp, 1)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{num(y?.pond, 3)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{y?.pn ? `#${num(y.pn)}` : "—"}</td>
              <td className="px-3 py-2.5 text-right">{y ? <CategoriaBadge cat={y.cat} /> : "—"}</td>
            </tr>
          ))}
          <tr className="bg-muted/30">
            <th scope="row" className="px-3 py-2.5 text-left font-bold text-heading">
              Trienal
            </th>
            <td className="px-3 py-2.5 text-right tabular-nums">{num(c.tri.ev_tot)}</td>
            <td className="px-3 py-2.5 text-right">—</td>
            <td className="px-3 py-2.5 text-right tabular-nums">{num(c.tri.simp, 1)}</td>
            <td className="px-3 py-2.5 text-right tabular-nums">{num(c.tri.ind, 3)}</td>
            <td className="px-3 py-2.5 text-right">—</td>
            <td className="px-3 py-2.5 text-right">
              <CategoriaBadge cat={c.tri.cat} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/**
 * Cuerpo de la ficha de un colegio: lo usan la página /alianza-colegios/[id]
 * y la ventana "Ver ficha" del explorador. Sin hooks ni acceso a datos, para
 * poder renderizarse tanto en el servidor como en el cliente.
 */
export function FichaColegio({ c }: { c: Colegio }) {
  const y = c.y26;
  const frontera = fronteraDe(c);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {[`Sector ${c.s.toLowerCase()}`, `Calendario ${c.c}`, `Evaluados 2026: ${num(y.ev)}`, `Evaluados en 3 años: ${num(c.tri.ev_tot)}`].map(
          (d) => (
            <span key={d} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
              {d}
            </span>
          )
        )}
      </div>

      <div className="space-y-8">
        {/* Categoría y promedios */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="ring-2 ring-primary">
            <CardContent>
              <div className="text-xs font-semibold text-muted-foreground">Categoría oficial trienal</div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-4xl font-extrabold text-heading">{c.tri.cat}</span>
                <CategoriaBadge cat={c.tri.cat} />
              </div>
              <div className="mt-3 text-sm text-foreground/80">
                Índice global trienal: <strong className="text-heading tabular-nums">{num(c.tri.ind, 2)}</strong>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Res. 677 de 2021 · cohortes 2024, 2025 y 2026</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-xs font-semibold text-muted-foreground">Promedio simple 2026</div>
              <div className="mt-1 text-3xl font-extrabold text-heading tabular-nums">{num(y.simp, 1)}</div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">(LC + MAT + CN + SC + ING) / 5</div>
              <div className="mt-1 text-xs text-muted-foreground">Las 5 materias pesan 20% cada una.</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-xs font-semibold text-muted-foreground">Promedio ponderado oficial 2026</div>
              <div className="mt-1 text-3xl font-extrabold text-heading tabular-nums">{num(y.pond, 3)}</div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">[3×(LC+MAT+CN+SC) + ING] / 13</div>
              <div className="mt-1 text-xs text-muted-foreground">Inglés pesa 7,7%; cada otra materia, 23,1%.</div>
            </CardContent>
          </Card>
        </div>

        {frontera ? (
          <div className="rounded-xl border border-warning/40 bg-warning-foreground p-4 text-sm leading-relaxed text-foreground/90">
            <div className="mb-1.5 flex items-center gap-2 font-bold text-warning">
              <Zap className="size-4" aria-hidden="true" /> Zona frontera: alto potencial de categoría {frontera.asciendeA}
            </div>
            Este colegio tiene un índice trienal de <strong>{num(c.tri.ind, 2)}</strong> (categoría {frontera.actual}) y
            está a solo <strong>{num(frontera.distancia, 2)} puntos</strong> del corte de {frontera.asciendeA}. Cuando el
            ICFES aplique el descarte reglamentario del 20% de los resultados más bajos (Res. 677 de 2021), que sube el
            promedio entre 1,5 y 2,5 puntos, tiene alta probabilidad de quedar en categoría {frontera.asciendeA}.
          </div>
        ) : null}

        {/* Puestos */}
        <section>
          <h3 className="mb-3 text-lg font-extrabold text-heading">Posición 2026</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Cifra titulo="En su municipio" valor={`#${num(y.pm)}`} />
            <Cifra titulo="En su departamento" valor={`#${num(y.pd)}`} />
            <Cifra titulo="En Colombia" valor={`#${num(y.pn)}`} />
            <Cifra titulo="Percentil nacional" valor={`${num(y.pg, 1)}%`} />
          </div>
        </section>

        {/* Materias */}
        <section>
          <h3 className="mb-1 text-lg font-extrabold text-heading">Competencias 2026</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Puntaje del colegio frente a la media nacional, y percentil: qué porcentaje de colegios del país quedó por
            debajo.
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardContent>
                <RadarCompetencias resultado={y} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-4">
                {MATERIAS.map((m) => (
                  <div key={m.id}>
                    <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                      <span className="font-semibold text-heading">{m.nombre}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {num(y[m.id])} pts · media nal. {num(MEDIA_NACIONAL_2026[m.id], 1)}
                      </span>
                    </div>
                    <Barra
                      etiqueta="Percentil"
                      valor={y[m.pct]}
                      max={100}
                      texto={`${num(y[m.pct], 1)}%`}
                      className="grid-cols-[auto_1fr_auto]"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-lg font-extrabold text-heading">Evolución 2024 – 2026</h3>
          <Historial c={c} />
        </section>
      </div>
    </div>
  );
}
