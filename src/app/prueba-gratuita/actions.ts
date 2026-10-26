"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBancoPrueba } from "@/lib/prueba-gratuita/banco";
import {
  esCuentaPruebaGratuita,
  getEstadoPrueba,
  materiasPendientes,
  type IncidenciaPrueba,
} from "@/lib/prueba-gratuita/estado";
import type { MateriaPrueba, Opcion } from "@/lib/prueba-gratuita/types";
import type { Incidencia, TipoIncidencia } from "@/lib/diagnostico/types";
import type { Json } from "@/lib/supabase/database.types";
import { construirInforme } from "@/lib/prueba-gratuita/informe";
import { sendInformePruebaEmail } from "@/lib/email/send-informe-prueba-email";

const OPCIONES: Opcion[] = ["A", "B", "C", "D"];
const TIPOS_INCIDENCIA: TipoIncidencia[] = ["pestaña_abandonada", "intento_copia", "intento_corte", "intento_pegado"];
const MAX_INCIDENCIAS_POR_MATERIA = 300;

export interface EnviarMateriaState {
  error?: string;
  finalizada?: boolean;
}

/**
 * Guarda las respuestas de una materia de la prueba gratuita. Cada
 * materia se envía una sola vez y en orden (la siguiente pendiente); al
 * enviar la última, la prueba queda finalizada y el estudiante pasa a su
 * informe. Todo se valida en el servidor contra el banco — el cliente
 * solo manda letras, nunca puntajes.
 */
export async function enviarMateriaPruebaAction(
  materia: string,
  respuestasCliente: Record<string, string>,
  incidenciasCliente: Incidencia[] = []
): Promise<EnviarMateriaState> {
  const profile = await requireRole("estudiante");
  if (!(await esCuentaPruebaGratuita(profile))) {
    return { error: "Tu cuenta no tiene una prueba gratuita asignada." };
  }

  const estado = await getEstadoPrueba(profile.id);
  if (estado.finalizada) return { error: "Ya terminaste la prueba gratuita." };

  const pendientes = materiasPendientes(profile.id, estado.respuestas);
  if (pendientes[0] !== materia) {
    return { error: "Esta materia ya fue enviada o no es la siguiente. Recarga la página." };
  }

  const banco = getBancoPrueba(materia as MateriaPrueba);
  const respuestas: Record<string, Opcion> = {};
  for (const item of banco) {
    const elegida = respuestasCliente[item.id] as Opcion;
    if (!OPCIONES.includes(elegida)) return { error: "Responde todas las preguntas antes de enviar." };
    respuestas[item.id] = elegida;
  }

  const nuevasRespuestas = { ...estado.respuestas, [materia]: respuestas };
  const finalizada = pendientes.length === 1;

  // La bitácora viene del navegador: se queda solo con lo que tiene la
  // forma esperada y se limita el tamaño para que no se pueda inflar.
  const idsBanco = new Set(banco.map((item) => item.id));
  const incidencias: IncidenciaPrueba[] = (Array.isArray(incidenciasCliente) ? incidenciasCliente : [])
    .filter((i) => i && TIPOS_INCIDENCIA.includes(i.tipo) && typeof i.timestamp === "string")
    .slice(0, MAX_INCIDENCIAS_POR_MATERIA)
    .map((i) => ({
      timestamp: i.timestamp.slice(0, 40),
      tipo: i.tipo,
      preguntaId: typeof i.preguntaId === "string" && idsBanco.has(i.preguntaId) ? i.preguntaId : null,
      detalle: String(i.detalle ?? "").slice(0, 200),
      materia: materia as MateriaPrueba,
    }));

  const admin = createAdminClient();
  const { error } = await admin.from("pruebas_gratuitas").upsert({
    profile_id: profile.id,
    respuestas: nuevasRespuestas,
    incidencias: [...estado.incidencias, ...incidencias] as unknown as Json,
    finalizada_en: finalizada ? new Date().toISOString() : null,
  });
  if (error) {
    console.error("Failed to save prueba gratuita:", error);
    return { error: "No se pudieron guardar tus respuestas. Intenta de nuevo." };
  }

  // Al terminar la última materia se le envía el informe en PDF a su
  // correo — después de responder, para no demorar el paso al informe.
  if (finalizada) {
    after(async () => {
      const { data: usuario } = await admin.auth.admin.getUserById(profile.id);
      const email = usuario?.user?.email;
      if (!email) return;
      const estadoFinal = await getEstadoPrueba(profile.id);
      await sendInformePruebaEmail(email, construirInforme(profile.nombre, estadoFinal).data);
    });
  }

  revalidatePath("/prueba-gratuita");
  return { finalizada };
}
