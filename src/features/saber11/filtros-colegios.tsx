"use client";

import { useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 [&>option]:bg-popover";

/** Valores por defecto: no se escriben en la URL para que quede corta. */
const DEFECTOS: Record<string, string> = { anio: "2026", min: "5", ambito: "filtro" };

const ANIOS = [
  { value: "2026", label: "2026 (actual)" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024 (A + B)" },
  { value: "tri", label: "Trienal 2024-2026" },
];

/**
 * Filtros del explorador. Viven en la URL (se pueden compartir y el botón
 * atrás funciona); cada cambio navega con los nuevos parámetros y vuelve a
 * la página 1. El buscador espera a que se deje de escribir.
 */
export function FiltrosColegios({ departamentos, municipios }: { departamentos: string[]; municipios: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const busquedaRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const valor = (k: string) => params.get(k) ?? DEFECTOS[k] ?? "";

  function actualizar(cambios: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(cambios)) {
      if (!v || v === DEFECTOS[k]) next.delete(k);
      else next.set(k, v);
    }
    next.delete("pagina");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  useEffect(() => () => clearTimeout(busquedaRef.current), []);

  const hayFiltros = ["q", "anio", "dep", "mun", "sector", "cal", "cat", "min", "top", "ambito"].some((k) =>
    params.has(k)
  );

  const select = (id: string, label: string, opciones: { value: string; label: string }[], extra?: Record<string, string>) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`f-${id}`} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <select
        id={`f-${id}`}
        value={valor(id)}
        onChange={(e) => actualizar({ [id]: e.target.value, ...extra })}
        className={SELECT_CLASS}
      >
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5" aria-busy={isPending}>
      <div className="relative mb-4">
        <Label htmlFor="f-q" className="sr-only">
          Buscar colegio
        </Label>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          id="f-q"
          type="search"
          defaultValue={valor("q")}
          placeholder="Buscar colegio por nombre, código DANE o municipio…"
          className="h-11 pl-9 text-base md:text-base"
          onChange={(e) => {
            const v = e.target.value;
            clearTimeout(busquedaRef.current);
            busquedaRef.current = setTimeout(() => actualizar({ q: v.trim() }), 350);
          }}
        />
        {isPending ? (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {select("anio", "Año a consultar", ANIOS)}
        {select(
          "dep",
          "Departamento",
          [{ value: "", label: "Todos los departamentos" }, ...departamentos.map((d) => ({ value: d, label: d }))],
          { mun: "" }
        )}
        <div className={cn(!valor("dep") && "opacity-60")}>
          {select("mun", "Municipio", [
            { value: "", label: valor("dep") ? "Todos los municipios" : "Elige un departamento" },
            ...municipios.map((m) => ({ value: m, label: m })),
          ])}
        </div>
        {select("sector", "Sector", [
          { value: "", label: "Todos los sectores" },
          { value: "Oficial", label: "Oficial (público)" },
          { value: "Privado", label: "No oficial (privado)" },
        ])}
        {select("cal", "Calendario", [
          { value: "", label: "Todos los calendarios" },
          { value: "A", label: "Calendario A" },
          { value: "B", label: "Calendario B" },
        ])}
        {select("cat", "Categoría ICFES", [
          { value: "", label: "Todas las categorías" },
          { value: "FRONTERA", label: "Zona frontera (posible ascenso)" },
          { value: "A+", label: "A+ (muy superior)" },
          { value: "A", label: "A (superior)" },
          { value: "B", label: "B (medio)" },
          { value: "C", label: "C (bajo)" },
          { value: "D", label: "D (inferior)" },
          { value: "SC", label: "SC (sin clasificación)" },
        ])}
        {select("min", "Mínimo de evaluados", [
          { value: "0", label: "Todos los colegios" },
          { value: "5", label: "5 o más (estándar)" },
          { value: "10", label: "10 o más" },
          { value: "20", label: "20 o más" },
        ])}
        <div className="grid grid-cols-2 gap-3">
          {select("top", "Posición", [
            { value: "", label: "Todos" },
            ...[5, 10, 20, 50, 100, 200].map((n) => ({ value: String(n), label: `Top ${n}` })),
          ])}
          {select("ambito", "Puesto en", [
            { value: "filtro", label: "Este filtro" },
            { value: "mun", label: "Su municipio" },
            { value: "dep", label: "Su departamento" },
            { value: "nal", label: "Colombia" },
          ])}
        </div>
      </div>

      {hayFiltros ? (
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const input = document.getElementById("f-q") as HTMLInputElement | null;
              if (input) input.value = "";
              const vista = params.get("vista");
              startTransition(() => router.replace(vista ? `${pathname}?vista=${vista}` : pathname, { scroll: false }));
            }}
          >
            <X aria-hidden="true" /> Limpiar filtros
          </Button>
        </div>
      ) : null}
    </div>
  );
}
