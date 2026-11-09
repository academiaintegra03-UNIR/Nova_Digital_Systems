import { MATERIAS, MEDIA_NACIONAL_2026, num, type Resultado2026 } from "@/lib/saber11/utils";

const ETIQUETAS: Record<(typeof MATERIAS)[number]["id"], string> = {
  lc: "Lectura crítica",
  mat: "Matemáticas",
  cn: "Ciencias nat.",
  sc: "Sociales",
  ing: "Inglés",
};

const CX = 160;
const CY = 150;
const R = 100;
const NIVELES = [20, 40, 60, 80, 100];

/** Punto del eje i (empezando arriba, en sentido horario) para un valor 0-100. */
function punto(i: number, valor: number): [number, number] {
  const ang = -Math.PI / 2 + (i * 2 * Math.PI) / MATERIAS.length;
  const r = (Math.max(0, Math.min(100, valor)) / 100) * R;
  return [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
}

const poligono = (valores: number[]) => valores.map((v, i) => punto(i, v).join(",")).join(" ");

/**
 * Pentágono de competencias en SVG, escala 0-100: el colegio (área rellena,
 * línea continua) frente a la media nacional 2026 (línea discontinua). La
 * leyenda distingue las dos series por estilo de línea además del color, y
 * cada punto del colegio muestra su valor al pasar el cursor.
 */
export function RadarCompetencias({ resultado }: { resultado: Resultado2026 }) {
  const colegio = MATERIAS.map((m) => resultado[m.id]);
  const media = MATERIAS.map((m) => MEDIA_NACIONAL_2026[m.id]);

  return (
    <figure>
      <figcaption className="mb-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <svg width="20" height="8" aria-hidden="true">
            <line x1="0" y1="4" x2="20" y2="4" className="stroke-chart-1" strokeWidth="2" />
          </svg>
          Colegio (2026)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="20" height="8" aria-hidden="true">
            <line x1="0" y1="4" x2="20" y2="4" className="stroke-muted-foreground" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          Media nacional (2026)
        </span>
      </figcaption>
      <svg
        viewBox="0 0 320 300"
        className="mx-auto w-full max-w-sm"
        role="img"
        aria-label={`Puntajes del colegio: ${MATERIAS.map((m, i) => `${m.nombre} ${num(colegio[i])}`).join(", ")}. Media nacional: ${MATERIAS.map((m, i) => `${m.nombre} ${num(media[i], 1)}`).join(", ")}.`}
      >
        {NIVELES.map((n) => (
          <polygon key={n} points={poligono(MATERIAS.map(() => n))} className="fill-none stroke-border" strokeWidth="1" />
        ))}
        {MATERIAS.map((m, i) => {
          const [x, y] = punto(i, 100);
          const [lx, ly] = punto(i, 118);
          const anchor = Math.abs(lx - CX) < 4 ? "middle" : lx > CX ? "start" : "end";
          return (
            <g key={m.id}>
              <line x1={CX} y1={CY} x2={x} y2={y} className="stroke-border" strokeWidth="1" />
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="fill-muted-foreground text-[11px] font-semibold"
              >
                {ETIQUETAS[m.id]}
              </text>
            </g>
          );
        })}
        <polygon
          points={poligono(media)}
          className="fill-none stroke-muted-foreground"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <polygon points={poligono(colegio)} className="fill-chart-1/20 stroke-chart-1" strokeWidth="2" strokeLinejoin="round" />
        {colegio.map((v, i) => {
          const [x, y] = punto(i, v);
          return (
            <g key={MATERIAS[i].id}>
              {/* Área de acierto mayor que el punto, para que el cursor lo encuentre fácil. */}
              <circle cx={x} cy={y} r="10" className="fill-transparent">
                <title>{`${MATERIAS[i].nombre}: ${num(v)} pts (media nacional ${num(media[i], 1)})`}</title>
              </circle>
              <circle cx={x} cy={y} r="4" className="pointer-events-none fill-card stroke-chart-1" strokeWidth="2" />
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
