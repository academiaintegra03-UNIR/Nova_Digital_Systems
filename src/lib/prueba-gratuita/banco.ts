import "server-only";
import type { ItemPrueba, ItemPruebaPublico, MateriaPrueba, Opcion } from "@/lib/prueba-gratuita/types";
import { toItemPublico } from "@/lib/prueba-gratuita/types";
import matematicasRaw from "@/lib/prueba-gratuita/bancos/matematicas.json";
import lecturaCriticaRaw from "@/lib/prueba-gratuita/bancos/lectura-critica.json";
import cienciasRaw from "@/lib/prueba-gratuita/bancos/ciencias.json";
import socialesRaw from "@/lib/prueba-gratuita/bancos/sociales.json";
import inglesRaw from "@/lib/prueba-gratuita/bancos/ingles.json";

const OPCIONES: Opcion[] = ["A", "B", "C", "D"];

/** La `clave` del JSON se cruza con el comentario del estudiante de esa
 * opción (que en el Excel fuente empieza por "Clave: X") — si alguien
 * edita uno y no el otro, falla al cargar en vez de calificar mal. */
function validarBanco(items: ItemPrueba[]): ItemPrueba[] {
  for (const item of items) {
    if (!OPCIONES.includes(item.clave)) throw new Error(`Ítem ${item.id} con clave inválida: ${item.clave}`);
    if (!item.comentarios[item.clave]?.estudiante.startsWith(`Clave: ${item.clave}`)) {
      throw new Error(`Ítem ${item.id}: la clave ${item.clave} no coincide con sus comentarios.`);
    }
  }
  return items;
}

const BANCOS: Partial<Record<MateriaPrueba, ItemPrueba[]>> = {
  matematicas: validarBanco(matematicasRaw as ItemPrueba[]),
  "lectura-critica": validarBanco(lecturaCriticaRaw as ItemPrueba[]),
  ciencias: validarBanco(cienciasRaw as ItemPrueba[]),
  sociales: validarBanco(socialesRaw as ItemPrueba[]),
  ingles: validarBanco(inglesRaw as ItemPrueba[]),
};

export function getMateriasDisponibles(): MateriaPrueba[] {
  return Object.keys(BANCOS) as MateriaPrueba[];
}

export function getBancoPrueba(materia: MateriaPrueba): ItemPrueba[] {
  return BANCOS[materia] ?? [];
}

export function getBancoPruebaPublico(materia: MateriaPrueba): ItemPruebaPublico[] {
  return getBancoPrueba(materia).map(toItemPublico);
}
