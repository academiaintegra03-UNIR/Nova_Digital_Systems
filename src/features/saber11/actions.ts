"use server";

import { getColegio, type Colegio } from "@/lib/saber11/data";

/** Datos de un colegio para la ventana "Ver ficha" (unos pocos KB, no todo el JSON). */
export async function getFichaColegioAction(id: string): Promise<Colegio | null> {
  return getColegio(id) ?? null;
}
