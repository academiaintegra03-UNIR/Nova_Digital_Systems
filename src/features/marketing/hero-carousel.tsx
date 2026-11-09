"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as React from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INTERVALO_MS = 7000;

export interface HeroSlide {
  id: string;
  /** Nombre corto para el lector de pantalla y los puntos de navegación. */
  label: string;
  /** Foto y degradados de fondo, a sangre detrás del contenido. */
  background: React.ReactNode;
  content: React.ReactNode;
}

/**
 * Carrusel del hero a todo el ancho, cada diapositiva con su propio fondo.
 * Usa scroll-snap nativo: se desliza con el dedo en móvil, con flechas o
 * puntos en escritorio y con Tab entre los enlaces. Avanza solo cada 7 s,
 * salvo que el usuario lo pause o esté con el teclado dentro. No se pausa al
 * pasar el cursor: el carrusel ocupa todo el ancho, así que casi siempre está
 * debajo del ratón y nunca avanzaría. Con "reducir movimiento" activado sigue
 * avanzando, pero cambia de golpe en vez de deslizarse. Las diapositivas
 * llegan ya renderizadas desde el servidor; aquí solo se maneja el movimiento.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [activa, setActiva] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [enFoco, setEnFoco] = useState(false);
  const [reducirMovimiento, setReducirMovimiento] = useState(false);

  const total = slides.length;

  const irA = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const destino = (i + total) % total;
      track.scrollTo({ left: destino * track.clientWidth, behavior: reducirMovimiento ? "auto" : "smooth" });
    },
    [total, reducirMovimiento]
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const actualizar = () => setReducirMovimiento(media.matches);
    actualizar();
    media.addEventListener("change", actualizar);
    return () => media.removeEventListener("change", actualizar);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setActiva(Math.round(track.scrollLeft / track.clientWidth));
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const autoplay = total > 1 && !pausado && !enFoco;

  useEffect(() => {
    if (!autoplay) return;
    const id = window.setInterval(() => irA(activa + 1), INTERVALO_MS);
    return () => window.clearInterval(id);
  }, [autoplay, activa, irA]);

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Novedades"
      // Solo el foco de teclado pausa: un clic en las flechas también enfoca el
      // botón, y no debe dejar el carrusel detenido.
      onFocus={(e) => setEnFoco(e.target.matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setEnFoco(false);
      }}
    >
      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <li
            key={s.id}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${total}: ${s.label}`}
            // inert: los enlaces de las diapositivas ocultas no reciben el foco con Tab.
            inert={i !== activa}
            className="relative isolate w-full shrink-0 snap-start"
          >
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
              {s.background}
            </div>
            <div className="mx-auto flex max-w-6xl flex-col justify-center px-4 pt-16 pb-28 sm:px-8 sm:pt-20 md:min-h-[34rem]">
              {s.content}
            </div>
          </li>
        ))}
      </ul>

      {total > 1 ? (
        <div className="absolute inset-x-0 bottom-8 mx-auto flex max-w-6xl items-center gap-3 px-4 sm:px-8">
          <div className="flex items-center gap-1">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => irA(i)}
                aria-label={`Ir a la diapositiva ${i + 1}: ${s.label}`}
                aria-current={i === activa ? "true" : undefined}
                className="flex size-6 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all",
                    i === activa ? "w-7 bg-glacier" : "w-1.5 bg-foreground/40"
                  )}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPausado((p) => !p)}
              aria-label={pausado ? "Reanudar el carrusel" : "Pausar el carrusel"}
            >
              {pausado ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => irA(activa - 1)} aria-label="Diapositiva anterior">
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => irA(activa + 1)} aria-label="Diapositiva siguiente">
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
