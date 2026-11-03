"use client";

import * as React from "react";

const PING_MS = 20_000;
const PING_TIMEOUT_MS = 8_000;
/** Archivo estático y fuera del middleware (ver matcher en middleware.ts):
 * el ping no toca Supabase ni renderiza nada. */
const PING_URL = "/favicon.ico";

/**
 * Detecta caídas de internet mientras `activo`. Los eventos online/offline
 * del navegador solo ven si hay red local, no si hay salida a internet,
 * así que además se hace un ping liviano cada 20 s. Avisa una sola vez por
 * cambio de estado (onCaida / onRecuperada) y devuelve si hay conexión.
 *
 * `enLineaInicial: false` sirve para retomar una caída que quedó abierta
 * (p. ej. el estudiante recargó sin internet): el primer ping que responda
 * dispara onRecuperada y la cierra.
 */
export function useMonitorConexion({
  activo,
  enLineaInicial = true,
  onCaida,
  onRecuperada,
}: {
  activo: boolean;
  enLineaInicial?: boolean;
  onCaida: () => void;
  onRecuperada: () => void;
}): boolean {
  const [enLinea, setEnLinea] = React.useState(enLineaInicial);
  const enLineaRef = React.useRef(enLineaInicial);
  const callbacksRef = React.useRef({ onCaida, onRecuperada });

  React.useEffect(() => {
    callbacksRef.current = { onCaida, onRecuperada };
  }, [onCaida, onRecuperada]);

  React.useEffect(() => {
    if (!activo) return;
    let cancelado = false;

    function marcar(valor: boolean) {
      if (cancelado || valor === enLineaRef.current) return;
      enLineaRef.current = valor;
      setEnLinea(valor);
      if (valor) callbacksRef.current.onRecuperada();
      else callbacksRef.current.onCaida();
    }

    async function ping() {
      if (!navigator.onLine) return marcar(false);
      try {
        // Cualquier respuesta, incluso un error del servidor, prueba que hay internet.
        await fetch(`${PING_URL}?ping=${Date.now()}`, {
          method: "HEAD",
          cache: "no-store",
          signal: AbortSignal.timeout(PING_TIMEOUT_MS),
        });
        marcar(true);
      } catch {
        marcar(false);
      }
    }

    const onOffline = () => marcar(false);
    // "online" solo dice que volvió la red local: se confirma con un ping.
    const onOnline = () => void ping();

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    const intervalo = window.setInterval(ping, PING_MS);
    void ping();

    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [activo]);

  return enLinea;
}
