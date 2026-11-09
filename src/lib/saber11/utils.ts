/*
 * Tipos y utilidades puras de los resultados Saber 11: sin acceso a los
 * datos, así que se pueden usar también en componentes de cliente (la
 * ventana de la ficha). La carga y los filtros están en data.ts.
 */

export type Sector = "Oficial" | "Privado";
export type Calendario = "A" | "B";
export type Categoria = "A+" | "A" | "B" | "C" | "D" | "SC";
export type Anio = "2026" | "2025" | "2024" | "tri";

interface ResultadoBase {
  /** Evaluados. */
  ev: number;
  /** Puntaje global (0-500). */
  g: number;
  simp: number;
  pond: number;
  lc: number;
  mat: number;
  sc: number;
  cn: number;
  ing: number;
  /** Puesto nacional. */
  pn: number;
  /** Percentil global. */
  pg: number;
  cat: string;
}

/** 2026 trae además puesto departamental/municipal y percentil por materia. */
export interface Resultado2026 extends ResultadoBase {
  pd: number;
  pm: number;
  plc: number;
  pmat: number;
  psc: number;
  pcn: number;
  ping: number;
}

export interface Trienal {
  ev_tot: number;
  simp: number;
  /** Índice global trienal (0-100). */
  ind: number;
  cat: string;
}

export interface Colegio {
  /** Código DANE. */
  id: string;
  n: string;
  s: Sector;
  c: Calendario;
  d: string;
  m: string;
  y26: Resultado2026;
  y25: ResultadoBase | null;
  y24: ResultadoBase | null;
  tri: Trienal;
}

/** Fila de la vista elegida (un año o el acumulado trienal). */
export interface FilaVista {
  ev: number;
  g: number | null;
  simp: number;
  pond: number;
  pn: number | null;
  pd: number | null;
  pm: number | null;
  pg: number | null;
  cat: string;
}

/** Categoría normalizada (los datos traen variantes como "SC (…)"). */
export function categoriaDe(cat: string | undefined): Categoria {
  if (!cat) return "SC";
  if (cat.startsWith("A+")) return "A+";
  if (cat.startsWith("A")) return "A";
  if (cat.startsWith("B")) return "B";
  if (cat.startsWith("C")) return "C";
  if (cat.startsWith("D")) return "D";
  return "SC";
}

export const CATEGORIAS: { id: Categoria; nombre: string; rango: string }[] = [
  { id: "A+", nombre: "Muy superior", rango: "Índice global mayor a 77,0" },
  { id: "A", nombre: "Superior", rango: "Entre 72,1 y 77,0" },
  { id: "B", nombre: "Medio", rango: "Entre 67,1 y 72,0" },
  { id: "C", nombre: "Bajo", rango: "Entre 62,1 y 67,0" },
  { id: "D", nombre: "Inferior", rango: "Igual o menor a 62,0" },
  { id: "SC", nombre: "Sin clasificación", rango: "Menos de 9 evaluados en 3 años" },
];

/**
 * Zona Frontera: índice trienal a menos de 2 puntos del corte de la
 * categoría superior. Con el descarte del 20% de resultados más bajos que
 * aplica el ICFES (Res. 677 de 2021) es probable que ascienda.
 */
const FRONTERAS: { min: number; max: number; corte: number; asciendeA: Categoria; actual: Categoria }[] = [
  { min: 75, max: 77, corte: 77.01, asciendeA: "A+", actual: "A" },
  { min: 70, max: 72, corte: 72.01, asciendeA: "A", actual: "B" },
  { min: 65, max: 67, corte: 67.01, asciendeA: "B", actual: "C" },
  { min: 60, max: 62, corte: 62.01, asciendeA: "C", actual: "D" },
];

export function fronteraDe(c: Colegio) {
  const ind = c.tri.ind;
  const f = FRONTERAS.find((z) => ind >= z.min && ind <= z.max);
  return f ? { ...f, distancia: f.corte - ind } : null;
}

export const MATERIAS = [
  { id: "lc", pct: "plc", nombre: "Lectura crítica" },
  { id: "mat", pct: "pmat", nombre: "Matemáticas" },
  { id: "cn", pct: "pcn", nombre: "Ciencias naturales" },
  { id: "sc", pct: "psc", nombre: "Sociales y ciudadanas" },
  { id: "ing", pct: "ping", nombre: "Inglés" },
] as const;

/** Media nacional 2026 por materia, la misma referencia del sitio original. */
export const MEDIA_NACIONAL_2026: Record<(typeof MATERIAS)[number]["id"], number> = {
  lc: 52.7,
  mat: 51.0,
  cn: 50.8,
  sc: 49.0,
  ing: 52.7,
};

// --------------------------------------------------------------- formato

const nf = (dec: number) => new Intl.NumberFormat("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });

export function num(v: number | null | undefined, dec = 0): string {
  return v == null ? "—" : nf(dec).format(v);
}
