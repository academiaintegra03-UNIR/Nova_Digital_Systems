"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPostulacionNotificacionEmail } from "@/lib/email/send-postulacion-emails";

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
  const { data: postulante, error: updateError } = await admin
    .from("postulaciones_prueba_gratuita")
    .update({ notificado })
    .eq("id", id)
    .select("nombre, email")
    .single();
  if (updateError) {
    console.error("Failed to update postulación:", updateError);
    return { error: "No se pudo actualizar la postulación." };
  }

  // Solo se avisa por correo al marcar como notificado — no al revertirlo a
  // pendiente. Best-effort: si el correo falla, el estado ya quedó
  // guardado, así que no se le muestra error al admin por esto.
  if (notificado && postulante) {
    await sendPostulacionNotificacionEmail(postulante.email, postulante.nombre);
  }

  revalidatePath("/admin/postulantes");
  return { success: true };
}
