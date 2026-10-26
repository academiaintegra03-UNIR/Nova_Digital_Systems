import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/require-role";
import { MiInformeContenido } from "@/features/prueba-gratuita/mi-informe-contenido";

export const metadata: Metadata = { title: "Mi informe — prueba gratuita" };

export default async function MiInformePage() {
  const profile = await requireRole("estudiante");
  return <MiInformeContenido profile={profile} />;
}
