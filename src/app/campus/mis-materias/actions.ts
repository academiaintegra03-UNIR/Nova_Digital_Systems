"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";

export interface EntregaActionState {
  error?: string;
  success?: boolean;
}

export async function entregarActividadAction(formData: FormData): Promise<EntregaActionState> {
  const caller = await requireRole("estudiante");

  const actividadId = String(formData.get("actividad_id") ?? "");
  if (!actividadId) return { error: "Falta la actividad." };

  const respuestaLink = String(formData.get("respuesta_link") ?? "").trim();

  const admin = createAdminClient();

  const { data: actividad } = await admin.from("actividades").select("id, grupo_id, tutor_id").eq("id", actividadId).single();
  if (!actividad) return { error: "Esa actividad ya no existe." };

  const { data: membership } = await admin
    .from("grupo_estudiantes")
    .select("student_id")
    .eq("grupo_id", actividad.grupo_id)
    .eq("student_id", caller.id)
    .maybeSingle();
  if (!membership) return { error: "Esa actividad no es de tu grupo." };

  const { error } = await admin.from("actividad_entregas").upsert(
    {
      actividad_id: actividadId,
      tutor_id: actividad.tutor_id,
      student_id: caller.id,
      estado: "entregada",
      respuesta_link: respuestaLink || null,
      entregado_at: new Date().toISOString(),
    },
    { onConflict: "actividad_id,student_id" }
  );
  if (error) {
    console.error("Failed to submit entrega:", error);
    return { error: "No se pudo enviar la entrega." };
  }

  revalidatePath("/campus/mis-materias");
  return { success: true };
}

async function verifyStudentInGrupo(admin: ReturnType<typeof createAdminClient>, grupoId: string, studentId: string) {
  const { data } = await admin
    .from("grupo_estudiantes")
    .select("student_id")
    .eq("grupo_id", grupoId)
    .eq("student_id", studentId)
    .maybeSingle();
  return Boolean(data);
}

export async function createHiloAction(formData: FormData): Promise<EntregaActionState & { id?: string }> {
  const caller = await requireRole("estudiante");

  const grupoId = String(formData.get("grupo_id") ?? "");
  const materiaId = String(formData.get("materia_id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!grupoId || !materiaId || !titulo) return { error: "Falta el título del hilo." };

  const admin = createAdminClient();
  if (!(await verifyStudentInGrupo(admin, grupoId, caller.id))) return { error: "Esa materia no es de tu grupo." };

  const { data: grupo } = await admin.from("grupos").select("tutor_id").eq("id", grupoId).single();

  const { data, error } = await admin
    .from("foro_hilos")
    .insert({ grupo_id: grupoId, materia_id: materiaId, tutor_id: grupo?.tutor_id ?? null, autor_id: caller.id, titulo })
    .select("id")
    .single();
  if (error) {
    console.error("Failed to create hilo (estudiante):", error);
    return { error: "No se pudo crear el hilo." };
  }

  revalidatePath("/campus/mis-materias");
  return { success: true, id: data.id };
}

export async function createMensajeAction(formData: FormData): Promise<EntregaActionState> {
  const caller = await requireRole("estudiante");

  const hiloId = String(formData.get("hilo_id") ?? "");
  const mensaje = String(formData.get("mensaje") ?? "").trim();
  if (!hiloId || !mensaje) return { error: "Escribe un mensaje." };

  const admin = createAdminClient();
  const { data: hilo } = await admin.from("foro_hilos").select("grupo_id, tutor_id").eq("id", hiloId).single();
  if (!hilo || !(await verifyStudentInGrupo(admin, hilo.grupo_id, caller.id))) {
    return { error: "Ese hilo no es de tu grupo." };
  }

  const { error } = await admin
    .from("foro_mensajes")
    .insert({ hilo_id: hiloId, tutor_id: hilo.tutor_id, autor_id: caller.id, mensaje });
  if (error) {
    console.error("Failed to create mensaje (estudiante):", error);
    return { error: "No se pudo enviar el mensaje." };
  }

  revalidatePath("/campus/mis-materias");
  return { success: true };
}
