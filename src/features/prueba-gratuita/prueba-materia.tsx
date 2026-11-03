"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, ClipboardX, Eye, Loader2, Maximize2, Send, Timer, WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { enviarMateriaPruebaAction } from "@/app/prueba-gratuita/actions";
import { formatCronometro, formatDuracion, type ItemPruebaPublico, type MateriaPrueba, type Opcion } from "@/lib/prueba-gratuita/types";
import type { Incidencia, TipoIncidencia } from "@/lib/diagnostico/types";

interface PruebaMateriaProps {
  materia: MateriaPrueba;
  materiaLabel: string;
  numeroMateria: number;
  totalMaterias: number;
  items: ItemPruebaPublico[];
  /** Clave de localStorage para el borrador (respuestas + bitácora) de
   * esta materia y este estudiante — si recarga la página no pierde lo
   * que llevaba, ni se borran las incidencias ya registradas. */
  storageKey: string;
  /** Segundos ya usados en las materias enviadas antes — el cronómetro
   * muestra el total de la prueba, no solo el de esta materia. */
  segundosPrevios: number;
}

interface Borrador {
  iniciada: boolean;
  /** Date.now() al pulsar "Comenzar". Va en el borrador para que el
   * cronómetro siga corriendo si recarga la página. */
  iniciadaEn: number | null;
  respuestas: Record<string, Opcion>;
  incidencias: Incidencia[];
}

const BORRADOR_VACIO: Borrador = { iniciada: false, iniciadaEn: null, respuestas: {}, incidencias: [] };

function leerBorrador(key: string): Borrador {
  try {
    const raw = window.localStorage.getItem(key);
    const borrador = raw ? { ...BORRADOR_VACIO, ...(JSON.parse(raw) as Borrador) } : BORRADOR_VACIO;
    // Un borrador de antes del cronómetro (iniciada sin hora) arranca a contar desde ya.
    return borrador.iniciada && !borrador.iniciadaEn ? { ...borrador, iniciadaEn: Date.now() } : borrador;
  } catch {
    return BORRADOR_VACIO;
  }
}

function guardarBorrador(key: string, borrador: Borrador) {
  try {
    window.localStorage.setItem(key, JSON.stringify(borrador));
  } catch {
    // Modo privado / almacenamiento bloqueado: la prueba sigue funcionando, solo sin borrador.
  }
}

function borrarBorrador(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ídem
  }
}

function ahora(): number {
  return Date.now();
}

function segundosDesde(inicio: number | null): number {
  return inicio ? Math.max(0, Math.floor((Date.now() - inicio) / 1000)) : 0;
}

/** Cronómetro de la prueba: tiempo acumulado de las materias anteriores
 * más lo que lleva en esta. Se calcula desde la hora de inicio (no
 * contando ticks), así no se desfasa si el navegador frena el intervalo
 * en segundo plano. */
function Cronometro({ inicio, segundosPrevios }: { inicio: number | null; segundosPrevios: number }) {
  const [segundos, setSegundos] = React.useState(() => segundosDesde(inicio));

  React.useEffect(() => {
    const id = window.setInterval(() => setSegundos(segundosDesde(inicio)), 1000);
    return () => window.clearInterval(id);
  }, [inicio]);

  return (
    <span
      className="font-data flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-bold text-heading tabular-nums"
      title={`Esta materia: ${formatCronometro(segundos)}`}
    >
      <Timer className="size-4 text-glacier-strong" aria-hidden="true" />
      <span className="sr-only">Tiempo total de la prueba: </span>
      {formatCronometro(segundosPrevios + segundos)}
    </span>
  );
}

/** Un toast a la vez: se descarta el anterior para que siempre se vea el aviso más reciente. */
function avisarIncidencia(mensaje: string) {
  toast.dismiss();
  toast.warning(mensaje, { id: `incidencia-${Date.now()}`, duration: 5000 });
}

const AVISOS: Record<TipoIncidencia, { detalle: string; aviso: string }> = {
  pestaña_abandonada: {
    detalle: "El estudiante cambió de pestaña o minimizó el navegador",
    aviso: "Saliste de la pestaña de la prueba. Quedó registrado en tu informe.",
  },
  intento_copia: {
    detalle: "El estudiante intentó copiar (Ctrl/Cmd+C o menú)",
    aviso: "Copiar el contenido de la prueba no está permitido. Quedó registrado en tu informe.",
  },
  intento_corte: {
    detalle: "El estudiante intentó cortar (Ctrl/Cmd+X o menú)",
    aviso: "Cortar el contenido de la prueba no está permitido. Quedó registrado en tu informe.",
  },
  intento_pegado: {
    detalle: "El estudiante intentó pegar (Ctrl/Cmd+V o menú)",
    aviso: "Pegar contenido en la prueba no está permitido. Quedó registrado en tu informe.",
  },
  conexion_perdida: {
    detalle: "Se perdió la conexión a internet",
    aviso: "Se perdió la conexión a internet. Puedes seguir respondiendo; quedó registrado en tu informe.",
  },
};

export function PruebaMateria({
  materia,
  materiaLabel,
  numeroMateria,
  totalMaterias,
  items,
  storageKey,
  segundosPrevios,
}: PruebaMateriaProps) {
  const router = useRouter();
  // Se renderiza solo en el cliente (ver prueba-materia-cliente.tsx), así
  // que el borrador de localStorage se puede leer al inicializar el estado.
  const [borradorInicial] = React.useState(() => leerBorrador(storageKey));
  const [iniciada, setIniciada] = React.useState(borradorInicial.iniciada);
  const [iniciadaEn, setIniciadaEn] = React.useState(borradorInicial.iniciadaEn);
  const [indice, setIndice] = React.useState(0);
  const [respuestas, setRespuestas] = React.useState<Record<string, Opcion>>(borradorInicial.respuestas);
  const [incidencias, setIncidencias] = React.useState<Incidencia[]>(borradorInicial.incidencias);
  const [sinConexion, setSinConexion] = React.useState(() => !navigator.onLine);
  const [confirmando, setConfirmando] = React.useState(false);
  const [imagenAmpliada, setImagenAmpliada] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const tituloRef = React.useRef<HTMLHeadingElement>(null);
  const indiceRef = React.useRef(0);
  const enviadaRef = React.useRef(false);

  const item = items[indice];
  const esUltima = indice === items.length - 1;
  const respondidas = items.filter((i) => respuestas[i.id]).length;
  const pendientes = items.map((i, n) => (respuestas[i.id] ? null : n)).filter((n): n is number => n !== null);
  const enExamen = iniciada;

  React.useEffect(() => {
    if (!enviadaRef.current) guardarBorrador(storageKey, { iniciada, iniciadaEn, respuestas, incidencias });
  }, [storageKey, iniciada, iniciadaEn, respuestas, incidencias]);

  React.useEffect(() => {
    indiceRef.current = indice;
  }, [indice]);

  // Telemetría de integridad — solo mientras se presenta la materia.
  React.useEffect(() => {
    if (!enExamen) return;

    function registrar(tipo: TipoIncidencia) {
      setIncidencias((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          tipo,
          preguntaId: items[indiceRef.current]?.id ?? null,
          detalle: AVISOS[tipo].detalle,
        },
      ]);
      avisarIncidencia(AVISOS[tipo].aviso);
    }

    function onVisibilityChange() {
      if (document.hidden) registrar("pestaña_abandonada");
    }
    // Ctrl/Cmd+C/X/V se detecta por teclado porque el evento nativo solo
    // se dispara si hay texto seleccionado (ver diagnostic-teaser.tsx); los
    // eventos copy/cut/paste cubren además el menú contextual. Las dos vías
    // se bloquean, y un mismo intento no se registra dos veces.
    const TIPO_POR_TECLA: Record<string, TipoIncidencia> = { c: "intento_copia", x: "intento_corte", v: "intento_pegado" };
    const TIPO_POR_EVENTO: Record<string, TipoIncidencia> = { copy: "intento_copia", cut: "intento_corte", paste: "intento_pegado" };
    let ultimoAtajo = 0;

    function onKeyDown(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const tipo = TIPO_POR_TECLA[e.key.toLowerCase()];
      if (!tipo) return;
      e.preventDefault();
      ultimoAtajo = Date.now();
      registrar(tipo);
    }
    function onClipboard(e: ClipboardEvent) {
      e.preventDefault();
      if (Date.now() - ultimoAtajo > 300) registrar(TIPO_POR_EVENTO[e.type]);
    }
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!enviadaRef.current) e.preventDefault();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("keydown", onKeyDown);
    for (const evento of Object.keys(TIPO_POR_EVENTO)) document.addEventListener(evento, onClipboard as EventListener);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("keydown", onKeyDown);
      for (const evento of Object.keys(TIPO_POR_EVENTO)) document.removeEventListener(evento, onClipboard as EventListener);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [enExamen, items]);

  // Cortes de internet: la prueba no se cierra (todo vive en el navegador y
  // el borrador en localStorage); se avisa, se bloquea el envío hasta que
  // vuelva la conexión y cada corte queda en la bitácora con su duración.
  React.useEffect(() => {
    if (!enExamen) return;
    let caidaEn: number | null = null;

    function onOffline() {
      caidaEn = Date.now();
      setSinConexion(true);
      setIncidencias((prev) => [
        ...prev,
        {
          timestamp: new Date(caidaEn ?? Date.now()).toISOString(),
          tipo: "conexion_perdida",
          preguntaId: items[indiceRef.current]?.id ?? null,
          detalle: AVISOS.conexion_perdida.detalle,
        },
      ]);
      toast.dismiss();
      toast.warning(AVISOS.conexion_perdida.aviso, { id: "sin-conexion", duration: Infinity });
    }

    function onOnline() {
      setSinConexion(false);
      if (caidaEn !== null) {
        const segundos = Math.max(1, Math.round((Date.now() - caidaEn) / 1000));
        const inicio = new Date(caidaEn).toISOString();
        // Completa el registro del corte con cuánto duró.
        setIncidencias((prev) =>
          prev.map((i) =>
            i.tipo === "conexion_perdida" && i.timestamp === inicio
              ? { ...i, detalle: `${AVISOS.conexion_perdida.detalle} durante ${formatDuracion(segundos)}` }
              : i
          )
        );
        caidaEn = null;
      }
      toast.dismiss("sin-conexion");
      toast.success("Volvió la conexión a internet. Ya puedes enviar la materia.");
    }

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [enExamen, items]);

  function irA(n: number) {
    setIndice(n);
    setConfirmando(false);
    // Al cambiar de pregunta el foco va al título, para que lector de
    // pantalla y teclado arranquen desde el inicio de la nueva pregunta.
    requestAnimationFrame(() => {
      tituloRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function comenzar() {
    setIniciada(true);
    setIniciadaEn(ahora());
    requestAnimationFrame(() => tituloRef.current?.focus());
  }

  function enviar() {
    setError(null);
    if (!navigator.onLine) {
      setError("No tienes conexión a internet. Tus respuestas siguen guardadas: envía la materia cuando vuelva la conexión.");
      setConfirmando(false);
      return;
    }
    startTransition(async () => {
      let result: Awaited<ReturnType<typeof enviarMateriaPruebaAction>>;
      try {
        result = await enviarMateriaPruebaAction(materia, respuestas, incidencias, segundosDesde(iniciadaEn));
      } catch {
        // Falla de red al llamar al servidor: no se pierde nada, el borrador sigue en el navegador.
        setError("No se pudo enviar por un problema de conexión. Tus respuestas siguen guardadas; intenta de nuevo.");
        setConfirmando(false);
        return;
      }
      if (result.error) {
        setError(result.error);
        setConfirmando(false);
        return;
      }
      enviadaRef.current = true;
      borrarBorrador(storageKey);
      toast.dismiss();
      if (result.finalizada) {
        router.push("/prueba-gratuita/informe");
      } else {
        toast.success(`${materiaLabel} enviada`);
        router.refresh();
      }
    });
  }

  if (!iniciada) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-8">
        <Card>
          <CardContent className="py-8">
            <p className="mb-1 text-sm font-semibold text-glacier-strong">
              Prueba gratuita Saber 11{totalMaterias > 1 ? ` · Materia ${numeroMateria} de ${totalMaterias}` : ""}
            </p>
            <h1 className="mb-4 text-2xl font-extrabold text-heading">{materiaLabel}</h1>
            <ul className="mb-6 space-y-3 text-sm leading-relaxed text-foreground/85">
              <li className="flex gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-glacier-strong" aria-hidden="true" />
                {items.length} preguntas de selección múltiple con una sola respuesta correcta. No hay límite de tiempo, pero un cronómetro mide cuánto tardas y el tiempo aparece en tu informe.
              </li>
              <li className="flex gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-glacier-strong" aria-hidden="true" />
                Puedes moverte entre preguntas y cambiar tus respuestas hasta que envíes la materia. Tu avance se guarda
                en este navegador si recargas la página.
              </li>
              <li className="flex gap-3">
                <Eye className="mt-0.5 size-4 shrink-0 text-glacier-strong" aria-hidden="true" />
                Mantente en esta pestaña: si sales de ella, queda registrado en tu informe.
              </li>
              <li className="flex gap-3">
                <ClipboardX className="mt-0.5 size-4 shrink-0 text-glacier-strong" aria-hidden="true" />
                Copiar, cortar y pegar están desactivados, y cada intento queda registrado.
              </li>
              <li className="flex gap-3">
                <Send className="mt-0.5 size-4 shrink-0 text-glacier-strong" aria-hidden="true" />
                Una vez envíes la materia no podrás cambiar tus respuestas. La prueba se presenta una sola vez.
              </li>
            </ul>
            <Button size="lg" className="w-full" onClick={comenzar}>
              Comenzar {materiaLabel}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enunciadoId = `enunciado-${item.id}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      {sinConexion ? (
        <Alert variant="destructive" className="mb-4">
          <WifiOff aria-hidden="true" />
          <AlertDescription>
            <strong>Sin conexión a internet.</strong> Puedes seguir respondiendo: tus respuestas y el cronómetro se
            guardan en este navegador. No recargues ni cierres la página. Para enviar la materia necesitas conexión.
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
        <span className="font-bold text-heading">
          {materiaLabel}
          {totalMaterias > 1 ? (
            <span className="font-semibold text-muted-foreground">
              {" "}
              · Materia {numeroMateria} de {totalMaterias}
            </span>
          ) : null}
        </span>
        <span className="flex items-center gap-3">
          <span className="font-semibold text-muted-foreground" aria-live="polite">
            {respondidas} de {items.length} respondidas
          </span>
          <Cronometro inicio={iniciadaEn} segundosPrevios={segundosPrevios} />
        </span>
      </div>
      <Progress
        value={(respondidas / items.length) * 100}
        className="mb-4 h-1.5"
        aria-label={`${respondidas} de ${items.length} preguntas respondidas`}
      />

      <nav aria-label="Ir a una pregunta" className="mb-5">
        <ol className="flex flex-wrap gap-1.5">
          {items.map((i, n) => {
            const respondida = Boolean(respuestas[i.id]);
            const actual = n === indice;
            return (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => irA(n)}
                  aria-current={actual ? "step" : undefined}
                  aria-label={`Pregunta ${n + 1}, ${respondida ? "respondida" : "sin responder"}`}
                  className={cn(
                    "font-data flex size-10 items-center justify-center rounded-lg border text-sm font-bold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    respondida
                      ? "border-primary bg-primary/15 text-heading"
                      : "border-border text-muted-foreground hover:border-primary/60",
                    actual && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  {n + 1}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <Card>
        <CardContent className="py-6">
          <h1
            ref={tituloRef}
            tabIndex={-1}
            className="mb-3 flex flex-wrap items-baseline justify-between gap-2 outline-none"
          >
            <span className="text-base font-extrabold text-heading">
              Pregunta {indice + 1} <span className="font-semibold text-muted-foreground">de {items.length}</span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-glacier-strong">{item.componente}</span>
          </h1>

          {item.contexto ? (
            <p className="font-data mb-4 whitespace-pre-line text-[0.95rem] leading-relaxed text-foreground select-none">
              {item.contexto}
            </p>
          ) : null}

          {item.imagenUrl ? (
            <button
              type="button"
              onClick={() => setImagenAmpliada(true)}
              className="group relative mb-4 block w-full overflow-hidden rounded-lg border border-border bg-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              aria-label={`Ampliar la imagen de la pregunta ${indice + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- imagen externa (Cloudinary) del banco de preguntas, no un asset local optimizable */}
              <img
                src={item.imagenUrl}
                alt={`Imagen de apoyo de la pregunta ${indice + 1}: gráfico o esquema descrito en el enunciado`}
                className="mx-auto max-h-96 w-full object-contain"
                draggable={false}
              />
              <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                <Maximize2 className="size-3.5" aria-hidden="true" /> Ampliar
              </span>
            </button>
          ) : null}

          <p id={enunciadoId} className="font-data mb-5 text-[0.95rem] font-bold leading-relaxed text-heading select-none">
            {item.enunciado}
          </p>

          <RadioGroup
            aria-labelledby={enunciadoId}
            value={respuestas[item.id] ?? ""}
            onValueChange={(value) => setRespuestas((r) => ({ ...r, [item.id]: value as Opcion }))}
            className="gap-3"
          >
            {(Object.entries(item.opciones) as [Opcion, string][]).map(([letra, texto]) => (
              <Label
                key={letra}
                htmlFor={`op-${item.id}-${letra}`}
                className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-border px-4 py-3 font-data text-[0.95rem] font-normal leading-relaxed select-none hover:border-primary/60 has-data-checked:border-primary has-data-checked:bg-primary/10 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
              >
                <RadioGroupItem value={letra} id={`op-${item.id}-${letra}`} className="mt-1" />
                <span>
                  <strong>{letra}.</strong> {texto}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3">
        <Button variant="outline" size="lg" onClick={() => irA(indice - 1)} disabled={indice === 0}>
          <ArrowLeft aria-hidden="true" /> Anterior
        </Button>
        {esUltima ? (
          <Button size="lg" onClick={() => setConfirmando(true)}>
            Revisar y enviar <Send aria-hidden="true" />
          </Button>
        ) : (
          <Button size="lg" onClick={() => irA(indice + 1)}>
            Siguiente <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </div>
      {!esUltima && respondidas === items.length ? (
        <div className="mt-3 text-right">
          <Button variant="link" onClick={() => setConfirmando(true)}>
            Ya respondiste todo — enviar {materiaLabel}
          </Button>
        </div>
      ) : null}

      <Dialog open={imagenAmpliada} onOpenChange={setImagenAmpliada}>
        <DialogContent className="max-w-[min(95vw,64rem)] sm:max-w-[min(95vw,64rem)]">
          <DialogHeader>
            <DialogTitle>Imagen de la pregunta {indice + 1}</DialogTitle>
          </DialogHeader>
          {item.imagenUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagen externa (Cloudinary)
            <img
              src={item.imagenUrl}
              alt={`Imagen ampliada de la pregunta ${indice + 1}`}
              className="max-h-[75vh] w-full rounded-lg bg-white object-contain"
              draggable={false}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmando} onOpenChange={(open) => !isPending && setConfirmando(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{pendientes.length > 0 ? "Te faltan preguntas" : `¿Enviar ${materiaLabel}?`}</DialogTitle>
            <DialogDescription>
              {pendientes.length > 0
                ? `Debes responder todas las preguntas antes de enviar. Te ${pendientes.length === 1 ? "falta" : "faltan"}:`
                : "Respondiste todas las preguntas. Una vez enviada no podrás cambiar tus respuestas."}
            </DialogDescription>
          </DialogHeader>
          {pendientes.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {pendientes.map((n) => (
                <li key={n}>
                  <Button variant="outline" size="sm" onClick={() => irA(n)}>
                    Pregunta {n + 1}
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmando(false)} disabled={isPending}>
              Seguir revisando
            </Button>
            {pendientes.length === 0 ? (
              <Button onClick={enviar} disabled={isPending || sinConexion}>
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" /> Enviando…
                  </>
                ) : (
                  "Enviar"
                )}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
