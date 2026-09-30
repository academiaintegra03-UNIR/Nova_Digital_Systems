"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, Loader2, Lock, Mail } from "lucide-react";
import { BANCO_LABEL, type BancoId, type Incidencia, type Opcion, type TipoIncidencia } from "@/lib/diagnostico/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProgressRow } from "@/components/shared/progress-row";

const BATERIAS: { id: BancoId; label: string; pago: boolean }[] = (
  Object.entries(BANCO_LABEL) as [BancoId, string][]
).map(([id, label]) => ({ id, label, pago: id !== "general" }));

interface PreguntaPublica {
  id: string;
  materia: string;
  enunciado: string;
  imagenUrl?: string;
  opciones: Record<Opcion, string>;
  requiereJustificacion?: boolean;
}

interface BancoResponse {
  bancoId: string;
  cronometroMinutos: number;
  preguntas: PreguntaPublica[];
}

interface DesgloseMateria {
  materia: string;
  total: number;
  aciertos: number;
  porcentaje: number;
  nivel: string;
}

interface ResultadoDiagnostico {
  aciertos: number;
  totalPreguntas: number;
  puntajeGlobal: number;
  nivelGlobal: string;
  enfoqueScore: number;
  desenfoquesCount: number;
  copyPasteCount: number;
  desgloseMaterias: DesgloseMateria[];
  perfilDominante: string | null;
}

interface SubmitResponse {
  resultado: ResultadoDiagnostico;
  analisisIA: string | null;
  whatsappLink: string | null;
}

interface LeadForm {
  estudianteNombre: string;
  estudianteEdad: string;
  estudianteEmail: string;
  colegio: string;
  acudienteEmail: string;
  acudienteTelefono: string;
  bancoId: BancoId;
}

export interface CuentaConocida {
  nombre: string;
  colegio: string | null;
  email: string | null;
}

function getLeadInicial(cuentaConocida?: CuentaConocida): LeadForm {
  return {
    estudianteNombre: cuentaConocida?.nombre ?? "",
    estudianteEdad: "",
    estudianteEmail: cuentaConocida?.email ?? "",
    colegio: cuentaConocida?.colegio ?? "",
    acudienteEmail: "",
    acudienteTelefono: "",
    bancoId: "general",
  };
}

/** El grado ya lo indica la batería elegida — no hace falta pedirlo
 * aparte (el selector de batería ya distingue 9°/10°/general). */
const GRADO_POR_BANCO: Record<BancoId, string | null> = {
  general: null,
  noveno: "9°",
  decimo: "10°",
};

type Paso = "lead" | "examen" | "enviando" | "resultado";

/** Solo letras (con tildes/ñ) y espacios; la primera letra de cada palabra en mayúscula. */
function formatearNombre(valor: string): string {
  return valor
    .replace(/[^\p{L}\s]/gu, "")
    .replace(/\s{2,}/g, " ")
    .replace(/(^|\s)(\p{L})/gu, (_, sep: string, letra: string) => sep + letra.toUpperCase());
}

function soloDigitos(valor: string, max: number): string {
  return valor.replace(/\D/g, "").slice(0, max);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Devuelve el motivo por el que el correo no es válido, o undefined si está vacío o es válido. */
function errorCorreo(valor: string): string | undefined {
  const v = valor.trim();
  if (!v) return undefined;
  if (!v.includes("@")) return "Falta el signo @ — un correo debe verse así: nombre@dominio.com";
  if (!EMAIL_REGEX.test(v)) return "Correo no válido — revisa que tenga el formato nombre@dominio.com";
  return undefined;
}

/** Cada aviso de integridad es un toast nuevo con id propio: se descarta el anterior
 * para que el estudiante siempre vea el aviso más reciente, en cualquier pregunta. */
function avisarIncidencia(mensaje: string) {
  toast.dismiss();
  toast.warning(mensaje, { id: `incidencia-${Date.now()}`, duration: 5000 });
}

function formatTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function DiagnosticTeaser({
  cuentaConocida,
  bateriasPagasHabilitadas = false,
}: {
  cuentaConocida?: CuentaConocida;
  /** Los cursos Pre-ICFES por grado (9°/10°) son pagos — solo se ofrecen
   * a un estudiante logueado con matrícula activa. El servidor vuelve a
   * validar esto igual (nunca es solo un filtro de interfaz). */
  bateriasPagasHabilitadas?: boolean;
} = {}) {
  const [paso, setPaso] = React.useState<Paso>("lead");
  const [lead, setLead] = React.useState<LeadForm>(() => getLeadInicial(cuentaConocida));
  const [error, setError] = React.useState<string>();
  const [requierePago, setRequierePago] = React.useState(false);
  const [isLoadingBanco, setIsLoadingBanco] = React.useState(false);
  const [errorEmailAcudiente, setErrorEmailAcudiente] = React.useState<string>();
  const [errorEmailEstudiante, setErrorEmailEstudiante] = React.useState<string>();
  const [banco, setBanco] = React.useState<BancoResponse | null>(null);
  const [indice, setIndice] = React.useState(0);
  const [respuestas, setRespuestas] = React.useState<Record<string, Opcion>>({});
  const [justificaciones, setJustificaciones] = React.useState<Record<string, string>>({});
  const [segundosRestantes, setSegundosRestantes] = React.useState(0);
  // Especificación de Jimmy Ramírez (2026-09-04): el foco (cambio de
  // pestaña) y el copiado/pegado son incidencias de peso distinto en el
  // índice de enfoque (-5% vs -10%), así que se cuentan por separado —
  // más la bitácora forense con cada incidencia individual.
  const desenfoquesRef = React.useRef(0);
  const copyPasteRef = React.useRef(0);
  const incidenciasLogRef = React.useRef<Incidencia[]>([]);
  const indiceRef = React.useRef(0);
  const totalSegundosRef = React.useRef(0);
  const segundosRestantesRef = React.useRef(0);
  const [resultado, setResultado] = React.useState<SubmitResponse | null>(null);

  const enExamen = paso === "examen";

  React.useEffect(() => {
    indiceRef.current = indice;
  }, [indice]);

  // Telemetría de foco/integridad — solo activa durante el examen.
  React.useEffect(() => {
    if (!enExamen) return;

    function registrar(tipo: TipoIncidencia, detalle: string) {
      incidenciasLogRef.current.push({
        timestamp: new Date().toISOString(),
        tipo,
        preguntaId: banco?.preguntas[indiceRef.current]?.id ?? null,
        detalle,
      });
    }

    function onVisibilityChange() {
      if (document.hidden) {
        desenfoquesRef.current += 1;
        registrar("pestaña_abandonada", "El estudiante cambió de pestaña o minimizó el navegador");
        avisarIncidencia("Detectamos que saliste de la pestaña del examen — esto se tiene en cuenta en tu índice de enfoque.");
      }
    }
    // Los eventos nativos "copy"/"cut"/"paste" del navegador solo se
    // disparan si hay una selección de texto válida (o un campo editable
    // enfocado) en ese instante. Al cambiar de pregunta, React reemplaza
    // el DOM y cualquier selección anterior queda inválida, así que
    // Ctrl/Cmd+C/X/V deja de disparar el evento nativo — por eso la
    // alerta solo salía la primera vez. Detectar la combinación de teclas
    // directamente evita depender de si hay algo seleccionado.
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "c") {
        copyPasteRef.current += 1;
        registrar("intento_copia", "El estudiante presionó Ctrl/Cmd+C durante el examen");
        avisarIncidencia("Evita copiar el texto del examen para procesarlo externamente — esto se tiene en cuenta en tu resultado.");
      } else if (key === "x") {
        copyPasteRef.current += 1;
        registrar("intento_corte", "El estudiante presionó Ctrl/Cmd+X durante el examen");
        avisarIncidencia("Evita cortar el texto del examen — esto se tiene en cuenta en tu resultado.");
      } else if (key === "v") {
        copyPasteRef.current += 1;
        registrar("intento_pegado", "El estudiante presionó Ctrl/Cmd+V durante el examen");
        avisarIncidencia("Evita pegar contenido externo en el examen — esto se tiene en cuenta en tu resultado.");
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [enExamen, banco]);

  const finalizarExamen = React.useCallback(async () => {
    if (!banco) return;
    setPaso("enviando");
    try {
      const res = await fetch("/api/diagnostico/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bancoId: banco.bancoId,
          lead: {
            estudianteNombre: lead.estudianteNombre,
            estudianteEdad: lead.estudianteEdad || undefined,
            estudianteEmail: lead.estudianteEmail || undefined,
            colegio: lead.colegio || undefined,
            grado: GRADO_POR_BANCO[lead.bancoId] ?? undefined,
            acudienteEmail: lead.acudienteEmail || undefined,
            acudienteTelefono: lead.acudienteTelefono || undefined,
          },
          respuestas,
          justificaciones,
          desenfoquesCount: desenfoquesRef.current,
          copyPasteCount: copyPasteRef.current,
          tiempoTotalMinutos: Math.round((totalSegundosRef.current - segundosRestantesRef.current) / 60),
          incidenciasLog: incidenciasLogRef.current,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo enviar el diagnóstico. Intenta de nuevo.");
        setPaso("examen");
        return;
      }
      const data: SubmitResponse = await res.json();
      setResultado(data);
      setPaso("resultado");
    } catch {
      setError("No se pudo enviar el diagnóstico. Revisa tu conexión e intenta de nuevo.");
      setPaso("examen");
    }
  }, [banco, lead, respuestas, justificaciones, setError]);

  // Cronómetro regresivo — auto-finaliza al llegar a 0. Un solo interval
  // por examen (no depende de segundosRestantes, que se actualiza con la
  // forma funcional) para no perder precisión reiniciándolo cada segundo.
  React.useEffect(() => {
    if (!enExamen) return;
    const id = setInterval(() => {
      setSegundosRestantes((s) => {
        const next = s <= 1 ? 0 : s - 1;
        segundosRestantesRef.current = next;
        if (s <= 1) {
          clearInterval(id);
          finalizarExamen();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [enExamen, finalizarExamen]);

  async function handleIniciar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setRequierePago(false);

    if (lead.bancoId !== "general" && !bateriasPagasHabilitadas) {
      setRequierePago(true);
      return;
    }

    if (!lead.estudianteNombre.trim()) {
      setError("Escribe el nombre del estudiante.");
      return;
    }
    if (!cuentaConocida && !lead.acudienteEmail.trim() && !lead.acudienteTelefono.trim()) {
      setError("Deja al menos un correo o teléfono del acudiente para enviarle el resultado.");
      return;
    }

    if (!cuentaConocida && lead.estudianteNombre.trim().length < 3) {
      setError("Escribe el nombre completo del estudiante (solo letras).");
      return;
    }
    const errAcudiente = errorCorreo(lead.acudienteEmail);
    const errEstudiante = errorCorreo(lead.estudianteEmail);
    setErrorEmailAcudiente(errAcudiente);
    setErrorEmailEstudiante(errEstudiante);
    if (errAcudiente || errEstudiante) {
      setError(errAcudiente ? `Correo del acudiente: ${errAcudiente}` : `Correo del estudiante: ${errEstudiante}`);
      return;
    }
    if (lead.acudienteTelefono.trim() && lead.acudienteTelefono.length < 7) {
      setError("El número de WhatsApp del acudiente no es válido.");
      return;
    }

    setIsLoadingBanco(true);
    try {
      const res = await fetch(`/api/diagnostico/banco?id=${encodeURIComponent(lead.bancoId)}`);
      if (!res.ok) throw new Error("banco_error");
      const data: BancoResponse = await res.json();
      setBanco(data);
      setIndice(0);
      setRespuestas({});
      setJustificaciones({});
      desenfoquesRef.current = 0;
      copyPasteRef.current = 0;
      incidenciasLogRef.current = [];
      indiceRef.current = 0;
      totalSegundosRef.current = data.cronometroMinutos * 60;
      segundosRestantesRef.current = data.cronometroMinutos * 60;
      setSegundosRestantes(data.cronometroMinutos * 60);
      setPaso("examen");
    } catch {
      setError("No se pudo cargar el diagnóstico. Intenta de nuevo en un momento.");
    } finally {
      setIsLoadingBanco(false);
    }
  }

  function reiniciar() {
    setPaso("lead");
    setLead(getLeadInicial(cuentaConocida));
    setBanco(null);
    setResultado(null);
    setError(undefined);
    setRequierePago(false);
  }

  if (paso === "lead") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-8">
        {cuentaConocida ? (
          <h1 className="mb-3.5 text-center text-3xl font-extrabold text-heading">
            Hola, {cuentaConocida.nombre.split(" ")[0]} — hagamos tu diagnóstico
          </h1>
        ) : (
          <>
            <div className="mb-2.5 text-center text-xs font-bold tracking-wide text-glacier-strong uppercase">
              Gratis · Sin compromiso
            </div>
            <h1 className="mb-3.5 text-center text-3xl font-extrabold text-heading">Diagnóstico académico</h1>
          </>
        )}
        <p className="mb-8 text-center text-base leading-relaxed text-foreground/80">
          Un vistazo breve y claro al nivel actual del estudiante: identificamos fortalezas y las áreas donde
          más conviene reforzar. No usamos puntajes garantizados ni predicciones — solo una recomendación
          honesta de por dónde empezar.
        </p>

        <Card>
          <CardContent className="py-6">
            <form onSubmit={handleIniciar} noValidate className="flex flex-col gap-4">
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              {requierePago ? (
                <Alert variant="destructive">
                  <AlertDescription className="flex flex-col gap-2">
                    <span>
                      Esta batería es contenido de matrícula paga. Necesitas un plan activo para presentarla.
                    </span>
                    <Button asChild size="sm" variant="cta" className="w-fit">
                      <Link href="/planes-precios">Ver planes y matricularme</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}

              {!cuentaConocida ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.6fr_1fr]">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dx-estudiante">Nombre completo del estudiante</Label>
                    <Input
                      id="dx-estudiante"
                      placeholder="Ej. Jimmy Alejandro"
                      value={lead.estudianteNombre}
                      onChange={(e) => setLead((l) => ({ ...l, estudianteNombre: formatearNombre(e.target.value) }))}
                      required
                      disabled={isLoadingBanco}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dx-edad">Edad</Label>
                    <Input
                      id="dx-edad"
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej. 17"
                      value={lead.estudianteEdad}
                      onChange={(e) => setLead((l) => ({ ...l, estudianteEdad: soloDigitos(e.target.value, 2) }))}
                      disabled={isLoadingBanco}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dx-edad">Edad (opcional)</Label>
                  <Input
                    id="dx-edad"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej. 17"
                    value={lead.estudianteEdad}
                    onChange={(e) => setLead((l) => ({ ...l, estudianteEdad: soloDigitos(e.target.value, 2) }))}
                    disabled={isLoadingBanco}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dx-bateria">Selecciona la batería diagnóstica a presentar</Label>
                <Select
                  value={lead.bancoId}
                  onValueChange={(value) => {
                    setRequierePago(false);
                    setLead((l) => ({ ...l, bancoId: value as BancoId }));
                  }}
                  disabled={isLoadingBanco}
                >
                  <SelectTrigger id="dx-bateria" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BATERIAS.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        <span className="flex items-center gap-2">
                          {b.label}
                          {b.pago && !bateriasPagasHabilitadas ? (
                            <Lock className="size-3.5 text-muted-foreground" aria-label="Requiere plan activo" />
                          ) : null}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!bateriasPagasHabilitadas ? (
                  <p className="text-xs text-muted-foreground">
                    Los cursos Pre-ICFES de 9° y 10° (
                    <Lock className="inline size-3 align-text-top" />) son contenido de matrícula paga. Puedes verlos
                    en la lista, pero para presentarlos necesitas un plan activo — se habilitan automáticamente en
                    cuanto el estudiante tiene una suscripción individual activa.
                  </p>
                ) : null}
              </div>

              {!cuentaConocida ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="dx-acudiente-email">Correo del acudiente (para el reporte oficial)</Label>
                      <Input
                        id="dx-acudiente-email"
                        type="email"
                        placeholder="Ej. acudiente@correo.com"
                        value={lead.acudienteEmail}
                        onChange={(e) => {
                          setLead((l) => ({ ...l, acudienteEmail: e.target.value }));
                          if (errorEmailAcudiente) setErrorEmailAcudiente(errorCorreo(e.target.value));
                        }}
                        onBlur={() => setErrorEmailAcudiente(errorCorreo(lead.acudienteEmail))}
                        aria-invalid={!!errorEmailAcudiente}
                        disabled={isLoadingBanco}
                      />
                      {errorEmailAcudiente ? <p className="text-xs text-destructive">{errorEmailAcudiente}</p> : null}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="dx-estudiante-email">Correo del estudiante (opcional — copia)</Label>
                      <Input
                        id="dx-estudiante-email"
                        type="email"
                        placeholder="Ej. estudiante@correo.com"
                        value={lead.estudianteEmail}
                        onChange={(e) => {
                          setLead((l) => ({ ...l, estudianteEmail: e.target.value }));
                          if (errorEmailEstudiante) setErrorEmailEstudiante(errorCorreo(e.target.value));
                        }}
                        onBlur={() => setErrorEmailEstudiante(errorCorreo(lead.estudianteEmail))}
                        aria-invalid={!!errorEmailEstudiante}
                        disabled={isLoadingBanco}
                      />
                      {errorEmailEstudiante ? <p className="text-xs text-destructive">{errorEmailEstudiante}</p> : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="dx-acudiente-tel">Celular del acudiente (WhatsApp)</Label>
                      <Input
                        id="dx-acudiente-tel"
                        type="tel"
                        inputMode="numeric"
                        placeholder="Ej. 3001234567"
                        value={lead.acudienteTelefono}
                        onChange={(e) => setLead((l) => ({ ...l, acudienteTelefono: soloDigitos(e.target.value, 15) }))}
                        disabled={isLoadingBanco}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="dx-colegio">Colegio o institución educativa (opcional)</Label>
                      <Input
                        id="dx-colegio"
                        placeholder="Ej. Colegio Santa María"
                        value={lead.colegio}
                        onChange={(e) => setLead((l) => ({ ...l, colegio: e.target.value }))}
                        disabled={isLoadingBanco}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Tu reporte llega automáticamente a tu acudiente registrado — no hace falta que dejes su
                  contacto aquí.
                </p>
              )}

              <Button type="submit" size="lg" variant="cta" className="mt-2" disabled={isLoadingBanco}>
                {isLoadingBanco ? "Cargando..." : "Comenzar diagnóstico"}
              </Button>
              {!cuentaConocida ? (
                <p className="text-center text-xs text-muted-foreground">
                  Si el estudiante es menor de edad, se asume el consentimiento del acudiente al dejar sus datos
                  de contacto arriba.
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paso === "examen" || paso === "enviando") {
    const pregunta = banco?.preguntas[indice];
    if (!banco || !pregunta) return null;

    const esUltima = indice === banco.preguntas.length - 1;

    // La justificación es obligatoria: no se puede avanzar ni finalizar sin ella.
    const justificacionPendiente =
      !!pregunta.requiereJustificacion && !(justificaciones[pregunta.id] ?? "").trim();
    function exigirJustificacion(): boolean {
      if (!justificacionPendiente) return true;
      setError("Justifica brevemente tu respuesta para continuar.");
      return false;
    }

    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
        <div className="mb-5 flex items-center justify-between text-sm">
          <span className="font-semibold text-muted-foreground">
            Pregunta {indice + 1} de {banco.preguntas.length}
          </span>
          <span className="font-data font-bold text-heading">{formatTiempo(segundosRestantes)}</span>
        </div>

        <Card>
          <CardContent className="py-6">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-glacier-strong">{pregunta.materia}</div>
            {pregunta.imagenUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- imagen externa (Cloudinary) del banco de preguntas, no un asset local optimizable
              <img
                src={pregunta.imagenUrl}
                alt="Imagen de apoyo para la pregunta"
                className="mb-4 max-h-80 w-full rounded-lg border border-border object-contain"
                loading="lazy"
              />
            ) : null}
            <p className="font-data mb-5 text-sm leading-relaxed text-foreground">{pregunta.enunciado}</p>

            <RadioGroup
              value={respuestas[pregunta.id] ?? ""}
              onValueChange={(value) => setRespuestas((r) => ({ ...r, [pregunta.id]: value as Opcion }))}
              className="mb-4 gap-3"
            >
              {(Object.entries(pregunta.opciones) as [Opcion, string][]).map(([letra, texto]) => (
                <Label
                  key={letra}
                  htmlFor={`op-${letra}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3.5 py-3 font-data text-sm font-normal has-data-checked:border-primary has-data-checked:bg-primary/5"
                >
                  <RadioGroupItem value={letra} id={`op-${letra}`} className="mt-0.5" />
                  <span>
                    <strong>{letra}.</strong> {texto}
                  </span>
                </Label>
              ))}
            </RadioGroup>

            {pregunta.requiereJustificacion ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dx-justificacion">Justifica brevemente tu respuesta</Label>
                <Textarea
                  id="dx-justificacion"
                  value={justificaciones[pregunta.id] ?? ""}
                  onChange={(e) => {
                    setJustificaciones((j) => ({ ...j, [pregunta.id]: e.target.value }));
                    setError(undefined);
                  }}
                  rows={2}
                  required
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        {error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-5 flex justify-between">
          <Button variant="outline" onClick={() => setIndice((i) => Math.max(0, i - 1))} disabled={indice === 0 || paso === "enviando"}>
            Anterior
          </Button>
          {esUltima ? (
            <Button onClick={() => exigirJustificacion() && finalizarExamen()} disabled={paso === "enviando"}>
              {paso === "enviando" ? (
                <>
                  <Loader2 className="animate-spin" /> Enviando...
                </>
              ) : (
                "Finalizar"
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (!exigirJustificacion()) return;
                setError(undefined);
                setIndice((i) => Math.min(banco.preguntas.length - 1, i + 1));
              }}
              disabled={paso === "enviando"}
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    );
  }

  // resultado
  if (!resultado || !banco) return null;
  const { resultado: r, analisisIA, whatsappLink } = resultado;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-8">
      <div className="mb-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-10 text-glacier-strong" aria-hidden="true" />
        <h1 className="font-data mb-1 text-3xl font-extrabold text-heading">{r.puntajeGlobal}%</h1>
        <p className="text-sm font-semibold text-glacier-strong">{r.nivelGlobal}</p>
        <p className="font-data text-sm text-muted-foreground">
          {r.aciertos} de {r.totalPreguntas} respuestas correctas
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="py-5">
          <h2 className="mb-3 text-sm font-bold text-heading">Desglose por materia</h2>
          {r.desgloseMaterias.map((m) => (
            <ProgressRow key={m.materia} label={`${m.materia} — ${m.nivel}`} pct={m.porcentaje} />
          ))}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">Índice de enfoque</span>
            <span className="font-bold text-foreground">{r.enfoqueScore}%</span>
          </div>
          {r.perfilDominante ? (
            <div className="flex items-center justify-between pt-1.5 text-sm">
              <span className="text-muted-foreground">Perfil dominante</span>
              <span className="font-bold text-foreground">{r.perfilDominante}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {analisisIA ? (
        <Card className="mb-4">
          <CardContent className="py-5">
            <h2 className="mb-2 text-sm font-bold text-heading">Recomendaciones</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{analisisIA}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-5 flex items-start gap-2.5 rounded-lg bg-muted px-4 py-3 text-sm text-foreground/80">
        <Mail className="mt-0.5 size-4 shrink-0 text-glacier-strong" aria-hidden="true" />
        <span>Te enviamos el reporte completo en PDF por correo — al estudiante y a su acudiente, si quedó registrado.</span>
      </div>

      <div className="flex flex-col items-center gap-3">
        {whatsappLink ? (
          <Button size="lg" asChild>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="gap-1.5">
              <ExternalLink className="size-4" /> Continuar por WhatsApp
            </a>
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onClick={reiniciar}>
          Hacer otro diagnóstico
        </Button>
      </div>
    </div>
  );
}
