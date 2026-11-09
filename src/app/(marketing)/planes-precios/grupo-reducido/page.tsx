import Link from "next/link";
import type { Metadata } from "next";
import {
  Activity,
  CalendarClock,
  CalendarDays,
  Check,
  HeartHandshake,
  MessageCircle,
  MonitorPlay,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconTile } from "@/components/shared/icon-tile";
import { SectionHeading } from "@/components/shared/section-heading";
import { getWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Grupo reducido — Preicfes grado 11 (2027)",
  description:
    "Preicfes Saber 11 Calendario A 2027, 100% virtual en vivo, en aulas de máximo 3 estudiantes con horario consensuado y mentoría 1 a 1.",
};

const PRECIO = "$1.112.000 COP";

const WHATSAPP_LINK = getWhatsAppLink(
  "Hola, deseo inscribir a mi hijo en el plan Grupo reducido (Premium) de Grado 11° Calendario A 2027 (100% virtual)."
);

const destacados = ["100% virtual en vivo", "Máximo 3 estudiantes", "Calendario A 2027"];

const pilares: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Users,
    title: "Aula virtual de máximo 3",
    desc: "Clases en vivo desde la comodidad de casa. Al ser solo 3 estudiantes en pantalla, la atención es total: cero distracciones y participación constante.",
  },
  {
    icon: CalendarClock,
    title: "Horarios consensuados",
    desc: "Al inicio se acuerda un horario base fijo de mutuo acuerdo. Si surgen semanas de exámenes del colegio, la sesión se reprograma con total flexibilidad.",
  },
  {
    icon: Activity,
    title: "Telemetría de fricción",
    desc: "Nuestra plataforma mide los segundos de duda antes de responder para identificar trampas cognitivas y vacíos conceptuales en tiempo real.",
  },
  {
    icon: HeartHandshake,
    title: "Resiliencia y mentoría",
    desc: "Canal prioritario 1 a 1 de soporte emocional y táctico para eliminar el pánico a los exámenes y estructurar hábitos de estudio universitario.",
  },
];

const fases: { etiqueta: string; titulo: string; icon: LucideIcon; puntos: { titulo: string; texto: string }[] }[] = [
  {
    etiqueta: "Fase 1 · Diagnóstico y desarme",
    titulo: "Auditoría de trampas y desarme de distractores",
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
    icon: Trophy,
    puntos: [
      { titulo: "Resistencia psicológica", texto: "Simulacros cronometrados de 4,5 horas sin fatiga mental." },
      { titulo: "Revisión 1 a 1", texto: "Análisis socrático de cada fallo para no repetirlo jamás." },
      { titulo: "Conquista de becas", texto: "Enfoque directo a la Distinción Andrés Bello y becas del 100%." },
    ],
  },
];

const incluye = [
  "Máximo 3 estudiantes por aula virtual",
  "Horario base consensuado, con flexibilidad ante exámenes del colegio",
  "Simulacros basados en el Diseño Centrado en la Evidencia (ECD)",
  "Mentoría de resiliencia emocional",
  "Revisión socrática 1 a 1 de los errores",
];

const faqs: { q: string; a: string }[] = [
  {
    q: "¿Cuándo inicia la cohorte?",
    a: "Para Calendario A iniciamos el sábado 6 de marzo de 2027 con la batería diagnóstica inicial y telemetría de entrada en vivo.",
  },
  {
    q: "¿Cómo se dictan las clases?",
    a: "Las clases son 100% virtuales y en vivo mediante nuestra plataforma interactiva y pizarras socráticas, con interacción directa entre los 3 estudiantes y el mentor.",
  },
  {
    q: "¿Cómo se manejan los horarios?",
    a: "Se concilia un horario base fijo de mutuo acuerdo entre los 3 estudiantes y el mentor, con flexibilidad total para reprogramar sesiones si surgen semanas de exámenes o imprevistos en el colegio.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "PSE, tarjetas de crédito y débito, Nequi, Daviplata y pasarela de pago en línea segura.",
  },
];

export default function GrupoReducidoPage() {
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
        Grupo reducido: Saber 11 de alto rendimiento
      </h1>
      <p className="mb-5 max-w-3xl text-base leading-relaxed text-foreground/80">
        Programa <strong className="text-heading">100% virtual en vivo</strong> de pensamiento crítico y entrenamiento
        táctico para el Saber 11. No entrenamos para memorizar preguntas de un solo día: formamos la estructura de
        pensamiento lógico, análisis crítico y autonomía intelectual que sirve en la universidad y que lleva al dominio
        del examen y a la conquista de becas de excelencia.
      </p>
      <div className="mb-10 flex flex-wrap gap-2">
        {destacados.map((d) => (
          <span
            key={d}
            className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-12">
          {/* Enfoque */}
          <section>
            <SectionHeading eyebrow="Enfoque" title="Formación para la vida y conquista del Saber 11" />
            <p className="mb-4 text-sm leading-relaxed text-foreground/80">
              La mayoría de jóvenes en 11° hacen cursos mecánicos que los saturan de fórmulas y trucos que olvidan a la
              semana. Nosotros hacemos lo opuesto:{" "}
              <strong className="text-heading">
                instalamos un modelo mental de pensamiento crítico, resiliencia y deducción autónoma
              </strong>
              . El estudiante aprende a pensar como un científico y a argumentar como un filósofo. Como resultado
              natural de este rigor, superar los 400 puntos y ganar becas del 100% se vuelve una consecuencia
              predecible.
            </p>
            <div className="flex items-start gap-2.5 rounded-xl bg-secondary/60 p-4 text-sm text-secondary-foreground">
              <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>Pensar mejor para triunfar en la universidad y asegurar tu beca en el Saber 11.</span>
            </div>
          </section>

          {/* Metodología */}
          <section>
            <SectionHeading eyebrow="Metodología" title="Acompañamiento 100% virtual" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {pilares.map((p) => (
                <Card key={p.title}>
                  <CardContent className="flex items-start gap-3.5">
                    <IconTile icon={p.icon} />
                    <div>
                      <div className="mb-1 text-base font-bold text-heading">{p.title}</div>
                      <div className="text-sm leading-relaxed text-muted-foreground">{p.desc}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Calendario */}
          <section>
            <SectionHeading eyebrow="Calendario" title="Diagnóstico y seguimiento del progreso" />
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <li className="flex items-start gap-3.5 rounded-xl border border-border bg-card p-4">
                <IconTile icon={CalendarDays} tone="accent" />
                <div>
                  <div className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Inicio</div>
                  <div className="mb-1 text-base font-bold text-heading">Sábado 6 de marzo de 2027</div>
                  <div className="text-sm leading-relaxed text-muted-foreground">
                    Batería diagnóstica para identificar dónde se pierde el razonamiento de cada estudiante.
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3.5 rounded-xl border border-border bg-card p-4">
                <IconTile icon={Trophy} tone="accent" />
                <div>
                  <div className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Cierre</div>
                  <div className="mb-1 text-base font-bold text-heading">Agosto de 2027</div>
                  <div className="text-sm leading-relaxed text-muted-foreground">
                    Simulacros completos cronometrados de 4,5 horas antes del examen oficial.
                  </div>
                </div>
              </li>
            </ol>
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
                    <div className="mb-3 text-base font-bold text-heading">{f.titulo}</div>
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
            <SectionHeading eyebrow="Dudas" title="Preguntas frecuentes" />
            <Accordion type="single" collapsible>
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`item-${i}`}>
                  <AccordionTrigger className="text-base font-bold text-heading">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        {/* Inversión y matrícula */}
        <aside aria-labelledby="titulo-inversion" className="order-first lg:order-last">
          <div className="sticky top-24 space-y-4">
            <Card className="ring-2 ring-primary">
              <CardContent>
                <div className="mb-3 flex items-center gap-2">
                  <MonitorPlay className="size-4 text-secondary-foreground" aria-hidden="true" />
                  <h2 id="titulo-inversion" className="text-xs font-bold tracking-wide text-secondary-foreground uppercase">
                    Inversión y matrícula
                  </h2>
                </div>
                <div className="text-3xl font-extrabold text-heading">{PRECIO}</div>
                <div className="mb-4 text-sm text-muted-foreground">Programa completo · Calendario A 2027</div>
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
                        <MessageCircle aria-hidden="true" /> Inscribirme por WhatsApp
                        <span className="sr-only">(se abre en otra pestaña)</span>
                      </a>
                    </Button>
                  ) : null}
                  <Button variant={WHATSAPP_LINK ? "outline" : "cta"} size="lg" className="w-full" asChild>
                    <Link href="/contacto">Hablar con un mentor</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground/80">
              <div className="mb-1.5 font-bold text-heading">Formen su propio equipo de 3</div>
              Se aprende mejor con personas cercanas: más confianza para debatir, motivación mutua y compromiso
              compartido. Si invitas a <strong className="text-heading">2 compañeros o amigos</strong> para completar tu
              equipo, todos reciben el <strong className="text-heading">beneficio de co-estudio</strong>: una sesión
              estratégica grupal adicional, sin costo.
            </div>

            <p className="text-center text-sm text-muted-foreground">
              ¿Son más de 3?{" "}
              <Link href="/planes-precios/grupos-y-colegios" className="font-bold text-heading underline-offset-4 hover:underline">
                Ver grupos y colegios
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
