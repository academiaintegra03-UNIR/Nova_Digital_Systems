"use client";

import * as React from "react";
import { CheckCircle2, Download, ExternalLink, Loader2 } from "lucide-react";
import { BANCO_LABEL, type BancoId, type Opcion } from "@/lib/diagnostico/types";
import { buildDiagnosticoPdf, diagnosticoReportFilename } from "@/lib/diagnostico/report-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProgressRow } from "@/components/shared/progress-row";

const BATERIAS: { id: BancoId; label: string }[] = (Object.entries(BANCO_LABEL) as [BancoId, string][]).map(
  ([id, label]) => ({ id, label })
);

interface PreguntaPublica {
  id: string;
  materia: string;
  enunciado: string;
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
}

interface ResultadoDiagnostico {
  aciertos: number;
  totalPreguntas: number;
  puntajeGlobal: number;
  enfoqueScore: number;
  desenfoquesCount: number;
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

function formatTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function DiagnosticTeaser({ cuentaConocida }: { cuentaConocida?: CuentaConocida } = {}) {
  const [paso, setPaso] = React.useState<Paso>("lead");
  const [lead, setLead] = React.useState<LeadForm>(() => getLeadInicial(cuentaConocida));
  const [error, setError] = React.useState<string>();
  const [isLoadingBanco, setIsLoadingBanco] = React.useState(false);

  const [banco, setBanco] = React.useState<BancoResponse | null>(null);
  const [indice, setIndice] = React.useState(0);
  const [respuestas, setRespuestas] = React.useState<Record<string, Opcion>>({});
  const [justificaciones, setJustificaciones] = React.useState<Record<string, string>>({});
  const [segundosRestantes, setSegundosRestantes] = React.useState(0);
  const desenfoquesRef = React.useRef(0);
  const [resultado, setResultado] = React.useState<SubmitResponse | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const enExamen = paso === "examen";

  // Telemetría de foco — solo activa durante el examen.
  React.useEffect(() => {
    if (!enExamen) return;
    function onVisibilityChange() {
      if (document.hidden) desenfoquesRef.current += 1;
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [enExamen]);

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
  }, [banco, lead, respuestas, justificaciones]);

  // Cronómetro regresivo — auto-finaliza al llegar a 0. Un solo interval
  // por examen (no depende de segundosRestantes, que se actualiza con la
  // forma funcional) para no perder precisión reiniciándolo cada segundo.
  React.useEffect(() => {
    if (!enExamen) return;
    const id = setInterval(() => {
      setSegundosRestantes((s) => {
        if (s <= 1) {
          clearInterval(id);
          finalizarExamen();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [enExamen, finalizarExamen]);

  async function handleIniciar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);

    if (!lead.estudianteNombre.trim()) {
      setError("Escribe el nombre del estudiante.");
      return;
    }
    if (!cuentaConocida && !lead.acudienteEmail.trim() && !lead.acudienteTelefono.trim()) {
      setError("Deja al menos un correo o teléfono del acudiente para enviarle el resultado.");
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
  }

  if (paso === "lead") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-8">
        {cuentaConocida ? (
          <h1 className="mb-3.5 text-center text-3xl font-extrabold text-primary">
            Hola, {cuentaConocida.nombre.split(" ")[0]} — hagamos tu diagnóstico
          </h1>
        ) : (
          <>
            <div className="mb-2.5 text-center text-xs font-bold tracking-wide text-[#2FA6A1] uppercase">
              Gratis · Sin compromiso
            </div>
            <h1 className="mb-3.5 text-center text-3xl font-extrabold text-primary">Diagnóstico académico</h1>
          </>
        )}
        <p className="mb-8 text-center text-base leading-relaxed text-foreground/80">
          Un vistazo breve y claro al nivel actual del estudiante: identificamos fortalezas y las áreas donde
          más conviene reforzar. No usamos puntajes garantizados ni predicciones — solo una recomendación
          honesta de por dónde empezar.
        </p>

        <Card>
          <CardContent className="py-6">
            <form onSubmit={handleIniciar} className="flex flex-col gap-4">
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
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
                      onChange={(e) => setLead((l) => ({ ...l, estudianteNombre: e.target.value }))}
                      required
                      disabled={isLoadingBanco}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dx-edad">Edad</Label>
                    <Input
                      id="dx-edad"
                      type="number"
                      min={1}
                      placeholder="Ej. 17"
                      value={lead.estudianteEdad}
                      onChange={(e) => setLead((l) => ({ ...l, estudianteEdad: e.target.value }))}
                      disabled={isLoadingBanco}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dx-edad">Edad (opcional)</Label>
                  <Input
                    id="dx-edad"
                    type="number"
                    min={1}
                    placeholder="Ej. 17"
                    value={lead.estudianteEdad}
                    onChange={(e) => setLead((l) => ({ ...l, estudianteEdad: e.target.value }))}
                    disabled={isLoadingBanco}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dx-bateria">Selecciona la batería diagnóstica a presentar</Label>
                <Select
                  value={lead.bancoId}
                  onValueChange={(value) => setLead((l) => ({ ...l, bancoId: value as BancoId }))}
                  disabled={isLoadingBanco}
                >
                  <SelectTrigger id="dx-bateria" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BATERIAS.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        onChange={(e) => setLead((l) => ({ ...l, acudienteEmail: e.target.value }))}
                        disabled={isLoadingBanco}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="dx-estudiante-email">Correo del estudiante (opcional — copia)</Label>
                      <Input
                        id="dx-estudiante-email"
                        type="email"
                        placeholder="Ej. estudiante@correo.com"
                        value={lead.estudianteEmail}
                        onChange={(e) => setLead((l) => ({ ...l, estudianteEmail: e.target.value }))}
                        disabled={isLoadingBanco}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="dx-acudiente-tel">Celular del acudiente (WhatsApp)</Label>
                      <Input
                        id="dx-acudiente-tel"
                        type="tel"
                        placeholder="Ej. +57 300 123 4567"
                        value={lead.acudienteTelefono}
                        onChange={(e) => setLead((l) => ({ ...l, acudienteTelefono: e.target.value }))}
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

              <Button type="submit" size="lg" className="mt-2" disabled={isLoadingBanco}>
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

    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
        <div className="mb-5 flex items-center justify-between text-sm">
          <span className="font-semibold text-muted-foreground">
            Pregunta {indice + 1} de {banco.preguntas.length}
          </span>
          <span className="font-bold text-primary">{formatTiempo(segundosRestantes)}</span>
        </div>

        <Card>
          <CardContent className="py-6">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[#2FA6A1]">{pregunta.materia}</div>
            <p className="mb-5 text-base leading-relaxed text-foreground">{pregunta.enunciado}</p>

            <RadioGroup
              value={respuestas[pregunta.id] ?? ""}
              onValueChange={(value) => setRespuestas((r) => ({ ...r, [pregunta.id]: value as Opcion }))}
              className="mb-4 gap-3"
            >
              {(Object.entries(pregunta.opciones) as [Opcion, string][]).map(([letra, texto]) => (
                <Label
                  key={letra}
                  htmlFor={`op-${letra}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3.5 py-3 text-sm font-normal has-data-checked:border-primary has-data-checked:bg-primary/5"
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
                <Label htmlFor="dx-justificacion">Justifica brevemente tu respuesta (opcional)</Label>
                <Textarea
                  id="dx-justificacion"
                  value={justificaciones[pregunta.id] ?? ""}
                  onChange={(e) => setJustificaciones((j) => ({ ...j, [pregunta.id]: e.target.value }))}
                  rows={2}
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
            <Button onClick={finalizarExamen} disabled={paso === "enviando"}>
              {paso === "enviando" ? (
                <>
                  <Loader2 className="animate-spin" /> Enviando...
                </>
              ) : (
                "Finalizar"
              )}
            </Button>
          ) : (
            <Button onClick={() => setIndice((i) => Math.min(banco.preguntas.length - 1, i + 1))} disabled={paso === "enviando"}>
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
  const bancoLabel = BATERIAS.find((b) => b.id === banco.bancoId)?.label ?? banco.bancoId;

  async function handleDescargarPdf() {
    setIsDownloading(true);
    try {
      const doc = await buildDiagnosticoPdf({
        estudianteNombre: lead.estudianteNombre,
        estudianteEdad: lead.estudianteEdad || undefined,
        colegio: lead.colegio || undefined,
        grado: GRADO_POR_BANCO[lead.bancoId],
        bancoLabel,
        createdAt: new Date().toISOString(),
        puntajeGlobal: r.puntajeGlobal,
        aciertos: r.aciertos,
        totalPreguntas: r.totalPreguntas,
        enfoqueScore: r.enfoqueScore,
        perfilDominante: r.perfilDominante,
        desgloseMaterias: r.desgloseMaterias,
        analisisIA,
      });
      doc.save(
        diagnosticoReportFilename({
          estudianteNombre: lead.estudianteNombre,
          bancoLabel,
          createdAt: new Date().toISOString(),
          puntajeGlobal: r.puntajeGlobal,
          aciertos: r.aciertos,
          totalPreguntas: r.totalPreguntas,
          enfoqueScore: r.enfoqueScore,
          perfilDominante: r.perfilDominante,
          desgloseMaterias: r.desgloseMaterias,
          analisisIA,
        })
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-8">
      <div className="mb-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-10 text-[#2FA6A1]" aria-hidden="true" />
        <h1 className="mb-1 text-3xl font-extrabold text-primary">{r.puntajeGlobal}%</h1>
        <p className="text-sm text-muted-foreground">
          {r.aciertos} de {r.totalPreguntas} respuestas correctas
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="py-5">
          <h2 className="mb-3 text-sm font-bold text-primary">Desglose por materia</h2>
          {r.desgloseMaterias.map((m) => (
            <ProgressRow key={m.materia} label={m.materia} pct={m.total > 0 ? Math.round((m.aciertos / m.total) * 100) : 0} />
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
            <h2 className="mb-2 text-sm font-bold text-primary">Recomendaciones</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{analisisIA}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col items-center gap-3">
        <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={handleDescargarPdf} disabled={isDownloading}>
          {isDownloading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
          Descargar reporte (PDF)
        </Button>
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
