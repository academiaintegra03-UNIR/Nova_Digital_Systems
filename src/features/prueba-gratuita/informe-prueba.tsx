import { AlertTriangle, CheckCircle2, ChevronDown, Eye, Sparkles, Target, XCircle } from "lucide-react";
import type { ResultadoItem, ResultadoMateria } from "@/lib/prueba-gratuita/estado";
import type { InformePruebaData } from "@/lib/prueba-gratuita/informe-pdf";
import { MATERIA_LABEL } from "@/lib/prueba-gratuita/types";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/** Etiquetas con tilde para las secciones de los comentarios, que en el
 * banco vienen sin tildes ("Como caiste | Plan de Accion"). */
const ETIQUETAS: Record<string, string> = {
  "Como caiste": "Cómo caíste",
  "Analisis de tu competencia": "Análisis de tu competencia",
  "Plan de Accion": "Plan de acción",
  Tipologia: "Tipología",
  "Intencion del error": "Intención del error",
  "Techo Taxonomico": "Techo taxonómico",
  "Sugerencia de Mejora": "Sugerencia de mejora",
  "Tip Tactico para el Docente": "Tip táctico para el docente",
  Intencion: "Intención",
};

const COLOR_NIVEL: Record<string, string> = {
  Avanzado: "bg-glacier-strong/20 text-heading",
  Satisfactorio: "bg-primary/15 text-heading",
  Mínimo: "bg-warning/20 text-heading",
  Inicial: "bg-destructive/20 text-heading",
};

function NivelBadge({ nivel }: { nivel: string }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", COLOR_NIVEL[nivel] ?? "bg-muted text-heading")}>
      {nivel}
    </span>
  );
}

/** Un comentario viene como "Trampa: X | Como caiste: … | …"; el de la
 * clave es un párrafo sin secciones ("Clave: B. ¡Excelente…"). */
function Retroalimentacion({ texto }: { texto: string }) {
  const secciones = texto.split(" | ");
  if (secciones.length === 1) return <p>{texto}</p>;

  return (
    <dl className="space-y-2">
      {secciones.map((seccion) => {
        const corte = seccion.indexOf(": ");
        const etiqueta = corte > 0 ? seccion.slice(0, corte) : "";
        const contenido = corte > 0 ? seccion.slice(corte + 2) : seccion;
        return (
          <div key={seccion}>
            {etiqueta ? <dt className="font-bold text-heading">{ETIQUETAS[etiqueta] ?? etiqueta}</dt> : null}
            <dd>{contenido}</dd>
          </div>
        );
      })}
    </dl>
  );
}

function DetalleItem({ resultado, numero, vistaDocente }: { resultado: ResultadoItem; numero: number; vistaDocente: boolean }) {
  const { item, elegida, correcta } = resultado;
  const Icono = correcta ? CheckCircle2 : XCircle;
  const comentario = elegida ? item.comentarios[elegida] : null;

  return (
    <details className="group rounded-lg border border-border bg-card/40 open:bg-card">
      <summary className="flex cursor-pointer list-none items-start gap-3 rounded-lg px-4 py-3 text-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
        <Icono
          className={cn("mt-0.5 size-5 shrink-0", correcta ? "text-glacier-strong" : "text-destructive")}
          aria-hidden="true"
        />
        <span className="flex-1 leading-relaxed">
          <span className="font-bold text-heading">
            Pregunta {numero} · {correcta ? "Correcta" : "Incorrecta"}
          </span>
          <span className="block text-foreground/75">{item.tarea}</span>
        </span>
        <ChevronDown
          className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="space-y-4 border-t border-border px-4 py-4 text-sm leading-relaxed text-foreground/85">
        {item.contexto ? <p className="font-data whitespace-pre-line">{item.contexto}</p> : null}
        {item.imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagen externa (Cloudinary) del banco de preguntas
          <img
            src={item.imagenUrl}
            alt={`Imagen de apoyo de la pregunta ${numero}`}
            className="max-h-72 w-full rounded-lg border border-border bg-white object-contain"
            loading="lazy"
          />
        ) : null}
        <p className="font-data font-bold text-heading">{item.enunciado}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className={cn("rounded-lg border px-3 py-2", correcta ? "border-glacier-strong/50" : "border-destructive/50")}>
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tu respuesta</div>
            <div className="font-data">{elegida ? `${elegida}. ${item.opciones[elegida]}` : "Sin responder"}</div>
          </div>
          {!correcta ? (
            <div className="rounded-lg border border-glacier-strong/50 px-3 py-2">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Respuesta correcta</div>
              <div className="font-data">
                {item.clave}. {item.opciones[item.clave]}
              </div>
            </div>
          ) : null}
        </div>

        {comentario?.estudiante ? (
          <div className="rounded-lg bg-muted px-4 py-3">
            <Retroalimentacion texto={comentario.estudiante} />
          </div>
        ) : null}
        {vistaDocente && comentario?.pedagogico ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-3">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Comentario pedagógico</div>
            <Retroalimentacion texto={comentario.pedagogico} />
          </div>
        ) : null}
      </div>
    </details>
  );
}

function slug(materia: string) {
  return `materia-${materia}`;
}

/**
 * Informe de la prueba gratuita — el mismo para el estudiante (al
 * terminar y desde su panel) y para el admin (con `vistaDocente`, que
 * además muestra el comentario pedagógico de cada respuesta).
 */
export function InformePrueba({
  data,
  resultados,
  acciones,
  vistaDocente = false,
}: {
  data: InformePruebaData;
  resultados: ResultadoMateria[];
  /** Botones bajo el resumen (descargar PDF, ir al panel, planes…). */
  acciones?: React.ReactNode;
  vistaDocente?: boolean;
}) {
  const sinIncidencias = data.incidencias.pestana + data.incidencias.copiaPegado === 0;
  const fecha = data.fecha
    ? new Date(data.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      {/* Resumen */}
      <Card className="mb-6 overflow-hidden">
        <CardContent className="py-7 text-center">
          <p className="mb-1 text-sm font-semibold text-glacier-strong">
            Prueba gratuita Saber 11{fecha ? ` · ${fecha}` : ""}
          </p>
          <h1 className="mb-3 text-xl font-extrabold text-heading">
            {vistaDocente ? `Informe de ${data.estudianteNombre}` : `${data.estudianteNombre.split(" ")[0]}, este es tu informe`}
          </h1>
          <div className="font-data text-6xl font-extrabold text-heading">{data.porcentajeGlobal}%</div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-foreground/80">
            <NivelBadge nivel={data.nivelGlobal} />
            <span>
              {data.correctas} de {data.total} respuestas correctas
            </span>
          </div>
          {acciones ? <div className="mt-6 flex flex-wrap justify-center gap-3">{acciones}</div> : null}
        </CardContent>
      </Card>

      {/* Por materia */}
      <section aria-labelledby="titulo-materias" className="mb-6">
        <h2 id="titulo-materias" className="mb-3 text-lg font-bold text-heading">
          Resultado por materia
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.materias.map((m, i) => (
            <li key={m.materia}>
              <a
                href={`#${slug(resultados[i].materia)}`}
                className="block rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <span className="font-bold text-heading">{m.materia}</span>
                  <span className="font-data text-lg font-extrabold text-heading">{m.porcentaje}%</span>
                </div>
                <Progress value={m.porcentaje} className="mb-2 h-1.5" aria-label={`${m.materia}: ${m.porcentaje}%`} />
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {m.correctas} de {m.total} correctas
                  </span>
                  <NivelBadge nivel={m.nivel} />
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Fortalezas / a reforzar */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="py-5">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-heading">
              <Sparkles className="size-4 text-glacier-strong" aria-hidden="true" /> Tus fortalezas
            </h2>
            {data.fortalezas.length ? (
              <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/85">
                {data.fortalezas.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-foreground/75">Todavía ninguna competencia supera el 70 % de aciertos.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-heading">
              <Target className="size-4 text-warning" aria-hidden="true" /> Qué reforzar
            </h2>
            {data.aReforzar.length ? (
              <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/85">
                {data.aReforzar.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-foreground/75">Ninguna competencia quedó por debajo del 50 %. ¡Bien!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seguimiento */}
      <Card className="mb-8">
        <CardContent className="flex items-start gap-3 py-5">
          {sinIncidencias ? (
            <Eye className="mt-0.5 size-5 shrink-0 text-glacier-strong" aria-hidden="true" />
          ) : (
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          )}
          <div className="text-sm">
            <h2 className="mb-1 font-bold text-heading">Seguimiento durante la prueba</h2>
            {sinIncidencias ? (
              <p className="text-foreground/80">No se registraron salidas de la pestaña ni intentos de copiar o pegar.</p>
            ) : (
              <p className="text-foreground/80">
                {data.incidencias.pestana} {data.incidencias.pestana === 1 ? "salida" : "salidas"} de la pestaña ·{" "}
                {data.incidencias.copiaPegado} {data.incidencias.copiaPegado === 1 ? "intento" : "intentos"} de copiar,
                cortar o pegar
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revisión por materia */}
      <h2 className="mb-1 text-lg font-bold text-heading">Revisa cada pregunta</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Abre cada pregunta para ver tu respuesta, la correcta y qué hacer para mejorar.
      </p>
      {resultados.map((resultado, i) => (
        <section key={resultado.materia} id={slug(resultado.materia)} className="mb-8 scroll-mt-6">
          <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-border pb-2">
            <h3 className="font-bold text-heading">{MATERIA_LABEL[resultado.materia]}</h3>
            <span className="text-sm text-muted-foreground">
              {resultado.correctas}/{resultado.total} · {data.materias[i].nivel}
            </span>
          </div>
          <ul className="mb-3 flex flex-wrap gap-2 text-xs">
            {resultado.porCompetencia.map((c) => (
              <li key={c.competencia} className="rounded-full bg-muted px-3 py-1 text-foreground/85">
                {c.competencia.replace(/\.$/, "")}: <strong className="font-data">{c.correctas}/{c.total}</strong>
              </li>
            ))}
          </ul>
          <div className="space-y-2">
            {resultado.items.map((r, n) => (
              <DetalleItem key={r.item.id} resultado={r} numero={n + 1} vistaDocente={vistaDocente} />
            ))}
          </div>
        </section>
      ))}

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Este informe es orientativo: no es un examen oficial ni certifica un puntaje ICFES.
      </p>
    </div>
  );
}
