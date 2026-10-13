"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePassword } from "@/lib/generate-password";
import {
  sendPostulacionAccesoCuentaExistenteEmail,
  sendPostulacionAccesoEmail,
} from "@/lib/email/send-postulacion-emails";

export interface PostulanteActionState {
  error?: string;
  success?: boolean;
  /** true cuando la cuenta quedó creada pero el correo con la contraseña
   * no se pudo enviar — el admin necesita hacer algo manualmente, porque
   * la contraseña no vuelve a mostrarse en ningún lado. */
  cuentaSinCorreo?: boolean;
}

/**
 * Notifica una postulación: crea la cuenta de estudiante con una
 * contraseña aleatoria y se la envía por correo junto con el acceso a la
 * prueba gratuita. Es una acción de un solo sentido — a diferencia de un
 * estado cualquiera, esto no se puede "desnotificar" (ya se creó la
 * cuenta y se mandó el correo), así que una vez marcada queda fija.
 */
export async function notificarPostulanteAction(formData: FormData): Promise<PostulanteActionState> {
  await requireRole("administrador");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el id de la postulación." };

  const admin = createAdminClient();

  const { data: postulante, error: fetchError } = await admin
    .from("postulaciones_prueba_gratuita")
    .select("nombre, email, notificado")
    .eq("id", id)
    .single();
  if (fetchError || !postulante) {
    console.error("Failed to load postulación:", fetchError);
    return { error: "No se encontró esa postulación." };
  }
  if (postulante.notificado) {
    return { error: "Esta postulación ya fue notificada — no se puede repetir." };
  }

  const password = generatePassword();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: postulante.email,
    password,
    email_confirm: true,
    // handle_new_user (0003_relationships.sql) crea el profile a partir
    // de este metadata — igual que en admin/usuarios/actions.ts.
    user_metadata: { role: "estudiante", nombre: postulante.nombre },
  });

  // Si el correo ya tenía cuenta, no se crea una nueva ni se le cambia la
  // contraseña — se avisa igual, pero sin credenciales nuevas.
  const yaExistia = !created?.user && createError?.message.toLowerCase().includes("already been registered");
  if (createError && !yaExistia) {
    console.error("Failed to create postulante account:", createError);
    return { error: "No se pudo crear la cuenta del estudiante." };
  }

  const { error: updateError } = await admin
    .from("postulaciones_prueba_gratuita")
    .update({ notificado: true, notificado_en: new Date().toISOString(), profile_id: created?.user?.id ?? null })
    .eq("id", id);
  if (updateError) {
    console.error("Failed to mark postulación as notificada:", updateError);
    return { error: "La cuenta se creó, pero no se pudo guardar el estado de la postulación." };
  }

  const emailEnviado = yaExistia
    ? await sendPostulacionAccesoCuentaExistenteEmail(postulante.email, postulante.nombre)
    : await sendPostulacionAccesoEmail(postulante.email, postulante.nombre, password);

  revalidatePath("/admin/postulantes");
  return { success: true, cuentaSinCorreo: !emailEnviado };
}
