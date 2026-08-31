"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { readClaseForm } from "@/lib/validation/clase";

export interface ClaseActionState {
  error?: string;
  success?: boolean;
}

export async function createClaseAction(formData: FormData): Promise<ClaseActionState> {
  const caller = await requireRole("tutor");

  const parsed = readClaseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const admin = createAdminClient();

  const { data: grupo } = await admin.from("grupos").select("tutor_id").eq("id", parsed.data.grupoId).single();
  if (!grupo || grupo.tutor_id !== caller.id) return { error: "Ese grupo no es tuyo." };

  const { error } = await admin.from("clases").insert({
    grupo_id: parsed.data.grupoId,
    materia_id: parsed.data.materiaId,
    tutor_id: caller.id,
    nombre: parsed.data.nombre,
    scheduled_at: parsed.data.scheduledAt,
    duration_minutes: parsed.data.durationMinutes,
    meeting_link: parsed.data.meetingLink,
    recording_link: parsed.data.recordingLink,
  });
  if (error) {
    console.error("Failed to create clase (tutor):", error);
    return { error: "No se pudo programar la clase." };
  }

  revalidatePath("/tutores");
  return { success: true };
}

export async function updateClaseAction(formData: FormData): Promise<ClaseActionState> {
  const caller = await requireRole("tutor");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta la clase a actualizar." };

  const parsed = readClaseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const admin = createAdminClient();

  const { data: existing } = await admin.from("clases").select("tutor_id").eq("id", id).single();
  if (!existing || existing.tutor_id !== caller.id) return { error: "Esa clase no es tuya." };

  const { data: grupo } = await admin.from("grupos").select("tutor_id").eq("id", parsed.data.grupoId).single();
  if (!grupo || grupo.tutor_id !== caller.id) return { error: "Ese grupo no es tuyo." };

  const { error } = await admin
    .from("clases")
    .update({
      grupo_id: parsed.data.grupoId,
      materia_id: parsed.data.materiaId,
      nombre: parsed.data.nombre,
      scheduled_at: parsed.data.scheduledAt,
      duration_minutes: parsed.data.durationMinutes,
      meeting_link: parsed.data.meetingLink,
      recording_link: parsed.data.recordingLink,
    })
    .eq("id", id);
  if (error) {
    console.error("Failed to update clase (tutor):", error);
    return { error: "No se pudo actualizar la clase." };
  }

  revalidatePath("/tutores");
  return { success: true };
}

export async function deleteClaseAction(formData: FormData): Promise<ClaseActionState> {
  const caller = await requireRole("tutor");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta la clase a eliminar." };

  const admin = createAdminClient();

  const { data: existing } = await admin.from("clases").select("tutor_id").eq("id", id).single();
  if (!existing || existing.tutor_id !== caller.id) return { error: "Esa clase no es tuya." };

  const { error } = await admin.from("clases").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete clase (tutor):", error);
    return { error: "No se pudo eliminar la clase." };
  }

  revalidatePath("/tutores");
  return { success: true };
}
