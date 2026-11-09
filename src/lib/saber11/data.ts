import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

/*
 * Resultados Saber 11 por colegio (corte PRISMA 2026, cohortes 2024-2026),
 * migrados de ndss-saber11.web.app. Los datos viven en colegios.json y se
 * leen una sola vez por proceso del servidor: son ~7 MB, así que nunca se
 * mandan al navegador — las páginas filtran aquí y envían solo una página
 * de resultados. Para actualizar el corte basta con reemplazar el JSON
 * (mismo formato). Se lee con fs y no con import para que TypeScript no
 * tenga que inferir el tipo de un JSON de ese tamaño; next.config.ts lo
 * incluye en el despliegue (outputFileTracingIncludes).
 */

import {
  CATEGORIAS,
  MATERIAS,
  categoriaDe,
  fronteraDe,
  type Anio,
  type Calendario,
  type Categoria,
  type Colegio,
  type FilaVista,
  type Sector,
} from "@/lib/saber11/utils";

export * from "@/lib/saber11/utils";

let cache: Colegio[] | null = null;

export function getColegios(): Colegio[] {
  if (!cache) {
    const archivo = path.join(process.cwd(), "src/lib/saber11/colegios.json");
    cache = JSON.parse(readFileSync(archivo, "utf-8")) as Colegio[];
  }
  return cache;
}

export function getColegio(id: string): Colegio | undefined {
  return getColegios().find((c) => c.id === id);
}

export function vistaDe(c: Colegio, anio: Anio): FilaVista | null {
  if (anio === "tri") {
    return {
      ev: c.tri.ev_tot,
      g: c.y26.g,
      simp: c.tri.simp,
      pond: c.tri.ind,
      pn: c.y26.pn,
      pd: c.y26.pd,
      pm: c.y26.pm,
      pg: c.y26.pg,
      cat: c.tri.cat,
    };
  }
  if (anio === "2026") return c.y26;
  const y = anio === "2025" ? c.y25 : c.y24;
  return y ? { ...y, pd: null, pm: null } : null;
}

// ---------------------------------------------------------------- filtros

export interface Filtros {
  q: string;
  anio: Anio;
  dep: string;
  mun: string;
  sector: "" | Sector;
  cal: "" | Calendario;
  cat: "" | Categoria | "FRONTERA";
  minEv: number;
  top: number | null;
  ambito: "filtro" | "mun" | "dep" | "nal";
  orden: Orden;
  asc: boolean;
  pagina: number;
}

export type Orden = "puesto" | "nombre" | "ubicacion" | "ev" | "g" | "simp" | "pond" | "pg";

const ANIOS: Anio[] = ["2026", "2025", "2024", "tri"];
const ORDENES: Orden[] = ["puesto", "nombre", "ubicacion", "ev", "g", "simp", "pond", "pg"];

type Params = Record<string, string | string[] | undefined>;

function texto(p: Params, k: string): string {
  const v = p[k];
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

/** Lee y valida los filtros de la URL; cualquier valor desconocido cae al defecto. */
export function leerFiltros(p: Params): Filtros {
  const anio = texto(p, "anio") as Anio;
  const sector = texto(p, "sector");
  const cal = texto(p, "cal");
  const cat = texto(p, "cat");
  const ambito = texto(p, "ambito");
  const orden = texto(p, "orden") as Orden;
  const minEv = Number(texto(p, "min") || 5);
  const top = Number(texto(p, "top"));
  const pagina = Number(texto(p, "pagina"));
  return {
    q: texto(p, "q"),
    anio: ANIOS.includes(anio) ? anio : "2026",
    dep: texto(p, "dep"),
    mun: texto(p, "mun"),
    sector: sector === "Oficial" || sector === "Privado" ? sector : "",
    cal: cal === "A" || cal === "B" ? cal : "",
    cat: (["A+", "A", "B", "C", "D", "SC", "FRONTERA"] as const).find((x) => x === cat) ?? "",
    minEv: [0, 5, 10, 20].includes(minEv) ? minEv : 5,
    top: [5, 10, 20, 50, 100, 200].includes(top) ? top : null,
    ambito: ambito === "mun" || ambito === "dep" || ambito === "nal" ? ambito : "filtro",
    orden: ORDENES.includes(orden) ? orden : "pond",
    asc: texto(p, "dir") === "asc",
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
  };
}

function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export interface ColegioFiltrado {
  colegio: Colegio;
  vista: FilaVista;
  /** Puesto dentro de la combinación de filtros activa. */
  puestoFiltro: number;
}

export function filtrarColegios(f: Filtros): ColegioFiltrado[] {
  const q = normalizar(f.q);
  let lista: ColegioFiltrado[] = [];

  for (const c of getColegios()) {
    if (f.dep && c.d !== f.dep) continue;
    if (f.mun && c.m !== f.mun) continue;
    if (f.sector && c.s !== f.sector) continue;
    if (f.cal && c.c !== f.cal) continue;
    if (q && !normalizar(c.n).includes(q) && !c.id.includes(q) && !normalizar(c.m).includes(q)) continue;
    const vista = vistaDe(c, f.anio);
    if (!vista) continue;
    if (f.cat === "FRONTERA" ? !fronteraDe(c) : f.cat && categoriaDe(vista.cat) !== f.cat) continue;
    if (f.minEv && vista.ev < f.minEv) continue;
    lista.push({ colegio: c, vista, puestoFiltro: 0 });
  }

  // El puesto dentro del filtro sigue el rendimiento, sin importar el orden visual.
  const rendimiento = (v: FilaVista) => v.g ?? v.pond * 5;
  lista.sort((a, b) => rendimiento(b.vista) - rendimiento(a.vista));
  lista.forEach((x, i) => (x.puestoFiltro = i + 1));

  if (f.top) {
    const limite = f.top;
    const puesto = (x: ColegioFiltrado) =>
      f.ambito === "mun" ? x.vista.pm : f.ambito === "dep" ? x.vista.pd : f.ambito === "nal" ? x.vista.pn : x.puestoFiltro;
    lista = lista.filter((x) => {
      const p = puesto(x);
      return p != null && p <= limite;
    });
  }

  const dir = f.asc ? 1 : -1;
  const valor = (x: ColegioFiltrado): string | number | null => {
    switch (f.orden) {
      case "puesto":
        return x.vista.pn;
      case "nombre":
        return x.colegio.n;
      case "ubicacion":
        return `${x.colegio.d} ${x.colegio.m}`;
      default:
        return x.vista[f.orden];
    }
  };
  lista.sort((a, b) => {
    const va = valor(a);
    const vb = valor(b);
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === "string" && typeof vb === "string") return va.localeCompare(vb, "es") * dir;
    return ((va as number) - (vb as number)) * dir;
  });

  return lista;
}

export function getDepartamentos(): string[] {
  return [...new Set(getColegios().map((c) => c.d))].sort((a, b) => a.localeCompare(b, "es"));
}

export function getMunicipios(dep: string): string[] {
  if (!dep) return [];
  return [...new Set(getColegios().filter((c) => c.d === dep).map((c) => c.m))].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

// ------------------------------------------------------------ estadísticas

export function resumenGeneral() {
  const todos = getColegios();
  return {
    total2026: todos.length,
    total2025: todos.filter((c) => c.y25).length,
    total2024: todos.filter((c) => c.y24).length,
    departamentos: new Set(todos.map((c) => c.d)).size,
    municipios: new Set(todos.map((c) => `${c.d}|${c.m}`)).size,
  };
}

export function estadisticas(lista: ColegioFiltrado[]) {
  const promedio = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const porSector = (s: Sector) => lista.filter((x) => x.colegio.s === s);
  const oficiales = porSector("Oficial");
  const privados = porSector("Privado");
  const global = (xs: ColegioFiltrado[]) => promedio(xs.map((x) => x.vista.g ?? x.vista.pond * 5));

  // Promedio por materia del año elegido (en la vista trienal, los de 2026).
  const anioMaterias = (c: Colegio, f: Anio) => (f === "2025" ? c.y25 : f === "2024" ? c.y24 : c.y26);
  const materias = (xs: ColegioFiltrado[], anio: Anio) =>
    Object.fromEntries(
      MATERIAS.map((m) => [
        m.id,
        promedio(xs.map((x) => anioMaterias(x.colegio, anio)?.[m.id]).filter((v): v is number => v != null)),
      ])
    ) as Record<(typeof MATERIAS)[number]["id"], number | null>;

  const categorias = Object.fromEntries(CATEGORIAS.map((c) => [c.id, 0])) as Record<Categoria, number>;
  for (const x of lista) categorias[categoriaDe(x.vista.cat)]++;

  return {
    total: lista.length,
    oficiales: oficiales.length,
    privados: privados.length,
    globalOficial: global(oficiales),
    globalPrivado: global(privados),
    materias: (anio: Anio) => ({ oficial: materias(oficiales, anio), privado: materias(privados, anio) }),
    categorias,
  };
}
