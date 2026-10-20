"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/** Máximo de opciones pintadas a la vez — el catálogo completo tiene miles. */
const MAX_VISIBLE = 80;

/** Minúsculas y sin tildes, para que "simon bolivar" encuentre "Simón Bolívar". */
function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

type Catalogo = { nombre: string; clave: string }[];

/**
 * El JSON se carga en diferido la primera vez que se abre la lista, así no
 * infla el bundle de las páginas que solo muestran el formulario.
 */
let catalogoPromise: Promise<Catalogo> | null = null;
function cargarCatalogo() {
  catalogoPromise ??= import("@/lib/data/instituciones.json").then((mod) =>
    (mod.default as string[]).map((nombre) => ({ nombre, clave: normalizar(nombre) }))
  );
  return catalogoPromise;
}

type InstitucionComboboxProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Campo de colegio/institución: se puede escribir para filtrar o abrir la
 * lista con la flecha y recorrerla. Si el colegio no está en el catálogo se
 * conserva lo que el usuario escribió.
 */
export function InstitucionCombobox({
  id,
  name,
  value,
  onChange,
  placeholder = "Escribe o busca tu colegio",
  disabled,
  className,
}: InstitucionComboboxProps) {
  const [catalogo, setCatalogo] = React.useState<Catalogo | null>(null);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listboxId = `${id ?? "institucion"}-listbox`;

  const abrir = React.useCallback(() => {
    setOpen(true);
    if (!catalogo) cargarCatalogo().then(setCatalogo);
  }, [catalogo]);

  const { opciones, total } = React.useMemo(() => {
    if (!catalogo) return { opciones: [], total: 0 };
    const consulta = normalizar(value);
    if (!consulta) return { opciones: catalogo.slice(0, MAX_VISIBLE), total: catalogo.length };
    // Todas las palabras deben aparecer, en cualquier orden; primero los que empiezan por la consulta.
    const palabras = consulta.split(/\s+/);
    const coincidencias = catalogo.filter((o) => palabras.every((p) => o.clave.includes(p)));
    coincidencias.sort((a, b) => Number(b.clave.startsWith(consulta)) - Number(a.clave.startsWith(consulta)));
    return { opciones: coincidencias.slice(0, MAX_VISIBLE), total: coincidencias.length };
  }, [catalogo, value]);

  // Cerrar al hacer clic fuera.
  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Mantener visible la opción resaltada al navegar con el teclado.
  React.useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function seleccionar(nombre: string) {
    onChange(nombre);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) abrir();
      setActiveIndex((i) => Math.min(i + 1, opciones.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && activeIndex >= 0 && opciones[activeIndex]) {
      e.preventDefault();
      seleccionar(opciones[activeIndex].nombre);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        ref={inputRef}
        id={id}
        name={name}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        className="pr-8"
        onFocus={abrir}
        onChange={(e) => {
          onChange(e.target.value);
          setActiveIndex(-1);
          if (!open) abrir();
        }}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={open ? "Cerrar lista de colegios" : "Ver lista de colegios"}
        disabled={disabled}
        className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:pointer-events-none"
        onClick={() => {
          if (open) setOpen(false);
          else {
            abrir();
            inputRef.current?.focus();
          }
        }}
      >
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md">
          <ul ref={listRef} id={listboxId} role="listbox" className="max-h-60 overflow-y-auto py-1">
            {opciones.map((o, i) => (
              <li
                key={`${o.nombre}-${i}`}
                id={`${listboxId}-${i}`}
                role="option"
                aria-selected={o.nombre === value}
                className={cn(
                  "cursor-pointer px-2.5 py-1.5 text-sm",
                  i === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
                  o.nombre === value && "font-medium"
                )}
                // mousedown en vez de click para que el input no pierda el foco antes de seleccionar.
                onMouseDown={(e) => {
                  e.preventDefault();
                  seleccionar(o.nombre);
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {o.nombre}
              </li>
            ))}
          </ul>
          <p className="border-t px-2.5 py-1.5 text-xs text-muted-foreground">
            {!catalogo
              ? "Cargando colegios..."
              : opciones.length === 0
                ? value.trim()
                  ? "No está en la lista — se guardará tal como lo escribiste."
                  : "Escribe el nombre de tu colegio."
                : total > opciones.length
                  ? `Mostrando ${opciones.length} de ${total.toLocaleString("es-CO")} — sigue escribiendo para filtrar.`
                  : `${total.toLocaleString("es-CO")} resultado${total === 1 ? "" : "s"}`}
          </p>
        </div>
      ) : null}
    </div>
  );
}
