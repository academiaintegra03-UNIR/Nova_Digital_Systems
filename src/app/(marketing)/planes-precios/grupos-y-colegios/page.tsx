import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, Check, MessageCircle, School, Sparkles, Target, Trophy, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconTile } from "@/components/shared/icon-tile";
import { SectionHeading } from "@/components/shared/section-heading";
import { getWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Grupos y colegios — Preicfes grado 11 (2027)",
  description:
    "Alianza 100% virtual para colegios y grupos de 4 a 10 estudiantes: preicfes Saber 11 Calendario A 2027 con simulacros de 4,5 horas y enfoque en becas.",
};

const PRECIO = "$888.000 COP";

const WHATSAPP_LINK = getWhatsAppLink(
  "Hola, somos del colegio y deseamos coordinar la propuesta institucional para Grado 11° Calendario A 2027 (inicio 6 de marzo)."
);

const destacados = ["100% virtual en vivo", "De 4 a 10 estudiantes", "Calendario A 2027"];

const cifras = [
  { valor: "+400", etiqueta: "Puntaje meta" },
  { valor: "0%", etiqueta: "Memorización pasiva" },
  { valor: "100%", etiqueta: "Pensamiento crítico" },
  { valor: "24/7", etiqueta: "Telemetría en vivo" },
];

const comparativa: { convencional: { titulo: string; texto: string }; nosotros: { titulo: string; texto: string } }[] = [
  {
    convencional: { titulo: "Aulas masivas", texto: "30 a 50 alumnos donde la duda individual se vuelve invisible." },
    nosotros: { titulo: "100% remoto en vivo", texto: "Comodidad sin traslados, desde casa y con pizarra socrática." },
  },
  {
    convencional: { titulo: "Memorización pasiva", texto: "Repetición de preguntas viejas sin desarrollar criterio propio." },
    nosotros: { titulo: "Aulas reducidas", texto: "Equipos de 4 a 10 estudiantes. Nadie se queda atrás." },
  },
  {
    convencional: { titulo: "Cero seguimiento", texto: "Solo te dicen si acertaste o fallaste, nunca el porqué ni cómo piensas." },
    nosotros: { titulo: "Debate socrático", texto: "El estudiante manipula variables y defiende sus ideas en vivo." },
  },
  {
    convencional: { titulo: "Horarios rígidos", texto: "Clases fijas que chocan con los exámenes y tareas del colegio." },
    nosotros: { titulo: "Telemetría de fricción", texto: "Medimos los momentos de duda y los patrones de fatiga mental." },
  },
  {
    convencional: { titulo: "Enfoque tardío", texto: "Empiezan tarde, cuando el margen de maniobra es mínimo." },
    nosotros: { titulo: "Simulacros de 4,5 horas", texto: "Práctica cronometrada en condiciones reales del examen." },
  },
];

const fases: {
  etiqueta: string;
  titulo: string;
  desc: string;
  icon: LucideIcon;
  puntos: { titulo: string; texto: string }[];
}[] = [
  {
    etiqueta: "Fase 1 · Diagnóstico y desarme",
    titulo: "Auditoría de trampas y desarme de distractores",
    desc: "Inicia el 6 de marzo de 2027 con una batería diagnóstica que muestra dónde se pierde el razonamiento y corrige los errores comunes en matemáticas, ciencias y lectura crítica.",
    icon: Target,
    puntos: [
      { titulo: "Inmunidad a trampas", texto: "Identificación instantánea de los patrones de distractores del ICFES." },
      { titulo: "Velocidad táctica", texto: "Optimización de segundos por pregunta en matemáticas y ciencias." },
      { titulo: "Telemetría precisa", texto: "Detección en vivo de los momentos de duda antes de que se vuelvan errores." },
    ],
  },
  {
    etiqueta: "Fase 2 · Resistencia y becas +400",
    titulo: "Simulacros de 4,5 h, resistencia mental y becas",
    desc: "Foco en superar los 400 puntos con simulacros cronometrados de 4,5 horas y la revisión 1 a 1 de cada pregunta fallada.",
    icon: Trophy,
    puntos: [
      { titulo: "Resistencia psicológica", texto: "Simulacros cronometrados de 4,5 horas sin fatiga mental." },
      { titulo: "Revisión 1 a 1", texto: "Análisis socrático de cada fallo para no repetirlo jamás." },
      { titulo: "Conquista de becas", texto: "Enfoque directo a la Distinción Andrés Bello y becas universitarias del 100%." },
    ],
  },
];

const incluye = [
  "De 4 a máximo 10 estudiantes por aula virtual",
  "3 horas semanales de clase en vivo, en 2 sesiones",
  "Simulacro diagnóstico de entrada y simulacro final de salida",
  "Simulacros completos de 4,5 horas cronometrados",
  "Debate argumentativo con un mentor especialista",
];

const faqs: { q: string; a: string }[] = [
  {
    q: "¿Cómo preparan a los estudiantes de 11° para superar los 400 puntos?",
    a: "Con telemetría de fricción cognitiva en tiempo real, simulacros cronometrados de 4,5 horas en vivo, revisión socrática 1 a 1 de cada fallo y entrenamiento intensivo para descartar distractores rápidamente, todo desde casa.",
  },
  {
    q: "¿Qué pasa si el estudiante tiene semanas de exámenes en el colegio?",
    a: "Las sesiones quedan grabadas y con acceso a la pizarra socrática interactiva, para que el estudiante pueda ponerse al día. Si se necesita un horario consensuado y reprogramable, está el plan Grupo reducido (máximo 3 estudiantes).",
  },
  {
    q: "¿Cómo recibe el colegio o los padres el reporte de avance?",
    a: "Entregamos reportes pedagógicos periódicos por WhatsApp y paneles con el análisis de telemetría, nivel de enfoque y progreso en las competencias ICFES.",
  },
  {
    q: "¿Cuáles son las formas de pago de la matrícula?",
    a: "Transferencias PSE, tarjetas de crédito y débito, Nequi, Daviplata y pasarela de pago en línea segura.",
  },
];

export default function GruposYColegiosPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <Link href="/planes-precios" className="text-sm font-bold text-secondary-foreground">
        ← Volver a planes y precios
      </Link>

      {/* Encabezado */}
      <div className="mt-4.5 text-xs font-bold tracking-wide text-secondary-foreground uppercase">
        Preicfes grado 11 · Calendario A 2027
      </div>
      <h1 className="mt-1.5 mb-3 text-3xl font-extrabold text-heading sm:text-4xl">
        Grupos y colegios: plan de choque y conquista de becas
      </h1>
      <p className="mb-5 max-w-3xl text-base leading-relaxed text-foreground/80">
        Una alianza <strong className="text-heading">100% virtual en vivo</strong> para colegios, cursos y grupos que se
        preparan juntos. Buscamos elevar el promedio Saber 11 de la institución y ayudar a los estudiantes a ganar becas
        universitarias del 100% (Distinción Andrés Bello), en aulas de 4 a 10 estudiantes.
      </p>
      <div className="mb-8 flex flex-wrap gap-2">
        {destacados.map((d) => (
          <span
            key={d}
            className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cifras.map((c) => (
          <div key={c.etiqueta} className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-extrabold text-heading">{c.valor}</div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">{c.etiqueta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-12">
          {/* Enfoque */}
          <section>
            <SectionHeading eyebrow="Enfoque" title="Formación integral y dominio del Saber 11" />
            <p className="mb-4 text-sm leading-relaxed text-foreground/80">
              En grado 11 no hay tiempo para repasos pasivos. La mayoría de los estudiantes no fallan por falta de
              estudio, sino por <strong className="text-heading">fatiga mental en la tercera hora del examen</strong> y
              por caer en los patrones de distractores que diseña el ICFES.
            </p>
            <p className="mb-4 text-sm leading-relaxed text-foreground/80">
              Por eso entrenamos <strong className="text-heading">criterio analítico, velocidad para descartar opciones
              y control emocional bajo la presión del reloj</strong>. Como resultado natural de este rigor, los
              estudiantes superan la barrera de los 400 puntos y conquistan becas universitarias completas.
            </p>
            <div className="flex items-start gap-2.5 rounded-xl bg-secondary/60 p-4 text-sm text-secondary-foreground">
              <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Cohorte Calendario A 2027, inicio el 6 de marzo: los colegios y grupos tienen aulas virtuales de 4 a 10
                estudiantes con simulacros completos de 4,5 horas cronometrados.
              </span>
            </div>
          </section>

          {/* Comparativa */}
          <section>
            <SectionHeading eyebrow="Comparativa" title="Preicfes tradicional vs. nuestro enfoque" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/40 p-5">
                <h3 className="mb-4 text-base font-bold text-muted-foreground">El enfoque convencional</h3>
                <ul className="space-y-3">
                  {comparativa.map(({ convencional: c }) => (
                    <li key={c.titulo} className="flex items-start gap-2.5">
                      <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                      <span className="text-sm leading-relaxed text-muted-foreground">
                        <strong className="text-foreground/80">{c.titulo}:</strong> {c.texto}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="ring-2 ring-primary">
                <CardContent>
                  <h3 className="mb-4 text-base font-bold text-heading">Soberano Cognitivo</h3>
                  <ul className="space-y-3">
                    {comparativa.map(({ nosotros: n }) => (
                      <li key={n.titulo} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                        <span className="text-sm leading-relaxed text-foreground/80">
                          <strong className="text-heading">{n.titulo}:</strong> {n.texto}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Fases */}
          <section>
            <SectionHeading
              eyebrow="Estructura"
              title="Dos fases para superar los 400 puntos"
              description="Un entrenamiento 100% virtual diseñado para dominar el examen oficial."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {fases.map((f) => (
                <Card key={f.etiqueta}>
                  <CardContent>
                    <div className="mb-3 flex items-center gap-3">
                      <IconTile icon={f.icon} size="sm" tone="primary" />
                      <span className="text-xs font-bold tracking-wide text-secondary-foreground uppercase">
                        {f.etiqueta}
                      </span>
                    </div>
                    <div className="mb-2 text-base font-bold text-heading">{f.titulo}</div>
                    <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                    <ul className="space-y-2.5">
                      {f.puntos.map((p) => (
                        <li key={p.titulo} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                          <span className="text-sm leading-relaxed text-foreground/80">
                            <strong className="text-heading">{p.titulo}:</strong> {p.texto}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Preguntas frecuentes */}
          <section>
            <SectionHeading eyebrow="Dudas" title="Preguntas frecuentes de familias y colegios" />
            <Accordion type="single" collapsible>
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`item-${i}`}>
                  <AccordionTrigger className="text-base font-bold text-heading">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Cierre */}
          <section className="rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
            <h2 className="mb-2 text-2xl font-extrabold text-heading">Asegura los cupos de tu colegio</h2>
            <p className="mx-auto mb-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Habla con la dirección pedagógica para coordinar la delegación de tu colegio, resolver preguntas
              específicas o agendar una llamada.
            </p>
            <div className="flex flex-col justify-center gap-2.5 sm:flex-row">
              <Button variant="cta" size="lg" asChild>
                {WHATSAPP_LINK ? (
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                    <MessageCircle aria-hidden="true" /> Hablar con la dirección pedagógica
                    <span className="sr-only">(se abre en otra pestaña)</span>
                  </a>
                ) : (
                  <Link href="/contacto">Hablar con la dirección pedagógica</Link>
                )}
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/diagnostico">Hacer el diagnóstico gratuito</Link>
              </Button>
            </div>
          </section>
        </div>

        {/* Inversión y matrícula */}
        <aside aria-labelledby="titulo-inversion" className="order-first lg:order-last">
          <div className="sticky top-24 space-y-4">
            <Card className="ring-2 ring-primary">
              <CardContent>
                <div className="mb-3 flex items-center gap-2">
                  <School className="size-4 text-secondary-foreground" aria-hidden="true" />
                  <h2 id="titulo-inversion" className="text-xs font-bold tracking-wide text-secondary-foreground uppercase">
                    Inversión y matrícula
                  </h2>
                </div>
                <div className="text-3xl font-extrabold text-heading">{PRECIO}</div>
                <div className="mb-4 text-sm text-muted-foreground">Por estudiante · programa completo</div>
                <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-muted/50 p-3 text-sm text-foreground/80">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-secondary-foreground" aria-hidden="true" />
                  <span>
                    <strong className="text-heading">Inicio: sábado 6 de marzo de 2027.</strong> Cupos limitados.
                  </span>
                </div>
                <ul className="mb-5 space-y-2">
                  {incluye.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      <span className="text-sm text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2.5">
                  {WHATSAPP_LINK ? (
                    <Button variant="cta" size="lg" className="w-full" asChild>
                      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                        <MessageCircle aria-hidden="true" /> Coordinar por WhatsApp
                        <span className="sr-only">(se abre en otra pestaña)</span>
                      </a>
                    </Button>
                  ) : null}
                  <Button variant={WHATSAPP_LINK ? "outline" : "cta"} size="lg" className="w-full" asChild>
                    <Link href="/contacto">Escribir a la dirección pedagógica</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground">
              ¿Prefieren máximo 3 estudiantes?{" "}
              <Link href="/planes-precios/grupo-reducido" className="font-bold text-heading underline-offset-4 hover:underline">
                Ver grupo reducido ($1.112.000)
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
