import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import { categoriaDe, type Categoria } from "@/lib/saber11/utils";
import { cn } from "@/lib/utils";

const TONO_CATEGORIA: Record<Categoria, StatusTone> = {
  "A+": "success",
  A: "success",
  B: "info",
  C: "warning",
  D: "error",
  SC: "neutral",
};

export function CategoriaBadge({ cat }: { cat: string | undefined }) {
  const c = categoriaDe(cat);
  return <StatusBadge tone={TONO_CATEGORIA[c]}>{c}</StatusBadge>;
}

/** Barra horizontal de un solo tono con su valor escrito al lado (nunca solo color). */
export function Barra({
  etiqueta,
  valor,
  max,
  texto,
  className,
}: {
  etiqueta: React.ReactNode;
  valor: number | null;
  max: number;
  texto: string;
  className?: string;
}) {
  const pct = valor == null ? 0 : Math.max(0, Math.min(100, (valor / max) * 100));
  return (
    <div className={cn("grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm", className)}>
      <span className="truncate text-foreground/80">{etiqueta}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full rounded-full bg-chart-1" style={{ width: `${pct}%` }} />
      </div>
      <span className="min-w-12 text-right font-semibold text-heading tabular-nums">{texto}</span>
    </div>
  );
}

export function Cifra({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs font-semibold text-muted-foreground">{titulo}</div>
      <div className="mt-1 text-2xl font-extrabold text-heading tabular-nums">{valor}</div>
      {detalle ? <div className="mt-0.5 text-xs text-muted-foreground">{detalle}</div> : null}
    </div>
  );
}

type Params = Record<string, string | string[] | undefined>;

/** Construye un enlace a la misma página conservando los filtros actuales. */
export function hrefCon(base: string, params: Params, cambios: Record<string, string | null>): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    const s = Array.isArray(v) ? v[0] : v;
    if (s) next.set(k, s);
  }
  for (const [k, v] of Object.entries(cambios)) {
    if (v == null || v === "") next.delete(k);
    else next.set(k, v);
  }
  const qs = next.toString();
  return qs ? `${base}?${qs}` : base;
}
