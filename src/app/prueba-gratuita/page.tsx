import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getBancoPruebaPublico, getMateriasDisponibles } from "@/lib/prueba-gratuita/banco";
import { getEstadoPrueba, materiasPendientes } from "@/lib/prueba-gratuita/estado";
import { MATERIA_LABEL } from "@/lib/prueba-gratuita/types";
import { PruebaMateriaCliente } from "@/features/prueba-gratuita/prueba-materia-cliente";

export const metadata: Metadata = { title: "Prueba gratuita" };

/** Presenta la siguiente materia pendiente, en el orden aleatorio propio
 * de cada estudiante (ver ordenMaterias en estado.ts). Al enviar la última, la
 * prueba queda finalizada y esta página pasa a redirigir al informe. */
export default async function PruebaGratuitaPage() {
  const profile = await requireRole("estudiante");
  const estado = await getEstadoPrueba(profile.id);
  const pendientes = materiasPendientes(profile.id, estado.respuestas);

  if (estado.finalizada || pendientes.length === 0) redirect("/prueba-gratuita/informe");

  const totalMaterias = getMateriasDisponibles().length;
  const materia = pendientes[0];

  return (
    <PruebaMateriaCliente
      key={materia}
      materia={materia}
      materiaLabel={MATERIA_LABEL[materia]}
      numeroMateria={totalMaterias - pendientes.length + 1}
      totalMaterias={totalMaterias}
      items={getBancoPruebaPublico(materia)}
      storageKey={`prueba-gratuita:${profile.id}:${materia}`}
    />
  );
}
