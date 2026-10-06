"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PostulanteActionState {
  error?: string;
  success?: boolean;
}

export async function marcarNotificadoAction(formData: FormData): Promise<PostulanteActionState> {
  await requireRole("administrador");

  const id = String(formData.get("id") ?? "");
  const notificado = formData.get("notificado") === "true";
  if (!id) return { error: "Falta el id de la postulación." };

  const admin = createAdminClient();
  const { error } = await admin.from("postulaciones_prueba_gratuita").update({ notificado }).eq("id", id);
  if (error) {
    console.error("Failed to update postulación:", error);
    return { error: "No se pudo actualizar la postulación." };
  }

  revalidatePath("/admin/postulantes");
  return { success: true };
}
