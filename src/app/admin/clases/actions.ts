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
  await requireRole("administrador");

  const parsed = readClaseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const tutorId = String(formData.get("tutor_id") ?? "").trim();

  const admin = createAdminClient();
  const { error } = await admin.from("clases").insert({
    grupo_id: parsed.data.grupoId,
    materia_id: parsed.data.materiaId,
    tutor_id: tutorId || null,
    nombre: parsed.data.nombre,
    scheduled_at: parsed.data.scheduledAt,
    duration_minutes: parsed.data.durationMinutes,
    meeting_link: parsed.data.meetingLink,
    recording_link: parsed.data.recordingLink,
  });
  if (error) {
    console.error("Failed to create clase:", error);
    return { error: "No se pudo crear la clase." };
  }

  revalidatePath("/admin/clases");
  return { success: true };
}

export async function updateClaseAction(formData: FormData): Promise<ClaseActionState> {
  await requireRole("administrador");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta la clase a actualizar." };

  const parsed = readClaseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const tutorId = String(formData.get("tutor_id") ?? "").trim();

  const admin = createAdminClient();
  const { error } = await admin
    .from("clases")
    .update({
      grupo_id: parsed.data.grupoId,
      materia_id: parsed.data.materiaId,
      tutor_id: tutorId || null,
      nombre: parsed.data.nombre,
      scheduled_at: parsed.data.scheduledAt,
      duration_minutes: parsed.data.durationMinutes,
      meeting_link: parsed.data.meetingLink,
      recording_link: parsed.data.recordingLink,
    })
    .eq("id", id);
  if (error) {
    console.error("Failed to update clase:", error);
    return { error: "No se pudo actualizar la clase." };
  }

  revalidatePath("/admin/clases");
  return { success: true };
}

export async function deleteClaseAction(formData: FormData): Promise<ClaseActionState> {
  await requireRole("administrador");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta la clase a eliminar." };

  const admin = createAdminClient();
  const { error } = await admin.from("clases").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete clase:", error);
    return { error: "No se pudo eliminar la clase." };
  }

  revalidatePath("/admin/clases");
  return { success: true };
}
