import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIAS, MATERIAS, estadisticas, num, type ColegioFiltrado, type Filtros } from "@/lib/saber11/data";
import { Barra, CategoriaBadge, Cifra } from "@/features/saber11/componentes";

export function EstadisticasColegios({ lista, filtros, contexto }: { lista: ColegioFiltrado[]; filtros: Filtros; contexto: string }) {
  const e = estadisticas(lista);
  const { oficial, privado } = e.materias(filtros.anio);
  const pct = (n: number) => (e.total ? `${num((n / e.total) * 100, 1)}%` : "—");
  const maxCategoria = Math.max(1, ...Object.values(e.categorias));
  const anioMaterias = filtros.anio === "tri" ? "2026" : filtros.anio;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {contexto} · {num(e.total)} colegios.
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Cifra titulo="Colegios oficiales (públicos)" valor={num(e.oficiales)} detalle={`${pct(e.oficiales)} de la selección`} />
        <Cifra titulo="Colegios no oficiales (privados)" valor={num(e.privados)} detalle={`${pct(e.privados)} de la selección`} />
        <Cifra titulo="Promedio global privado" valor={num(e.globalPrivado, 1)} detalle="Puntaje global (0-500)" />
        <Cifra titulo="Promedio global oficial" valor={num(e.globalOficial, 1)} detalle="Puntaje global (0-500)" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h3 className="mb-1 text-base font-bold text-heading">Promedio por competencia</h3>
            <p className="mb-4 text-xs text-muted-foreground">Oficial vs. privado · {anioMaterias} · escala 0-100</p>
            <div className="space-y-4">
              {MATERIAS.map((m) => (
                <div key={m.id}>
                  <div className="mb-1.5 text-sm font-semibold text-heading">{m.nombre}</div>
                  <div className="space-y-1.5">
                    <Barra etiqueta="Privado" valor={privado[m.id]} max={100} texto={num(privado[m.id], 1)} />
                    <Barra etiqueta="Oficial" valor={oficial[m.id]} max={100} texto={num(oficial[m.id], 1)} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="mb-1 text-base font-bold text-heading">Colegios por categoría ICFES</h3>
            <p className="mb-4 text-xs text-muted-foreground">Cantidad y porcentaje de la selección</p>
            <div className="space-y-3">
              {CATEGORIAS.map((c) => (
                <Barra
                  key={c.id}
                  etiqueta={
                    <span className="flex items-center gap-2">
                      <CategoriaBadge cat={c.id} />
                      <span className="truncate">{c.nombre}</span>
                    </span>
                  }
                  valor={e.categorias[c.id]}
                  max={maxCategoria}
                  texto={`${num(e.categorias[c.id])} · ${pct(e.categorias[c.id])}`}
                  className="grid-cols-[minmax(0,11rem)_1fr_auto]"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
