"use client";

import * as React from "react";

const TICK_MS = 1000;
/** Un salto mayor entre dos ticks es el equipo suspendido o el navegador
 * congelando la pestaña, no tiempo de trabajo: se descarta. */
const MAX_DELTA_MS = 5000;

/**
 * Cronómetro libre: suma el tiempo activo (pestaña visible) que pasa en
 * pantalla cada pregunta. No limita ni bloquea al estudiante — solo mide,
 * para el informe. Devuelve los milisegundos acumulados por id de ítem;
 * `inicial` permite retomar lo que ya llevaba (borrador en localStorage).
 */
export function useCronometroPreguntas({
  activo,
  preguntaId,
  inicial,
}: {
  activo: boolean;
  preguntaId: string;
  inicial: Record<string, number>;
}): Record<string, number> {
  const [tiemposMs, setTiemposMs] = React.useState(inicial);
  const preguntaRef = React.useRef(preguntaId);
  const ultimoRef = React.useRef(0);

  /** Suma a la pregunta en curso lo transcurrido desde la última marca. */
  const acumular = React.useCallback(() => {
    const ahora = Date.now();
    const delta = ahora - ultimoRef.current;
    ultimoRef.current = ahora;
    if (delta <= 0 || delta > MAX_DELTA_MS) return;
    const id = preguntaRef.current;
    setTiemposMs((t) => ({ ...t, [id]: (t[id] ?? 0) + delta }));
  }, []);

  // Al cambiar de pregunta, lo que iba del último tick se le abona a la
  // anterior antes de empezar a contar la nueva.
  React.useEffect(() => {
    if (activo) acumular();
    preguntaRef.current = preguntaId;
  }, [activo, preguntaId, acumular]);

  React.useEffect(() => {
    if (!activo) return;
    ultimoRef.current = Date.now();

    function onVisibilityChange() {
      // Al ocultarse se cierra la cuenta; al volver se arranca de cero,
      // así el tiempo fuera de la pestaña no se suma.
      if (document.hidden) acumular();
      else ultimoRef.current = Date.now();
    }
    const intervalo = window.setInterval(() => {
      if (document.hidden) ultimoRef.current = Date.now();
      else acumular();
    }, TICK_MS);

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [activo, acumular]);

  return tiemposMs;
}
