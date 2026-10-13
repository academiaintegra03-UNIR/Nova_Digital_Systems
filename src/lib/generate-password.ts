import "server-only";
import { randomInt } from "node:crypto";

// Sin 0/O, 1/l/I ni símbolos — una contraseña que el estudiante solo va a
// transcribir una vez desde un correo, nunca la escribe quien la genera.
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const LENGTH = 12;

/** Contraseña aleatoria para cuentas que crea el admin a nombre de otra
 * persona (p. ej. al notificar una postulación a la prueba gratuita).
 * Usa `crypto.randomInt` (no Math.random) porque esto sí es una
 * credencial real. */
export function generatePassword(length = LENGTH): string {
  let password = "";
  for (let i = 0; i < length; i++) {
    password += CHARSET[randomInt(CHARSET.length)];
  }
  return password;
}
