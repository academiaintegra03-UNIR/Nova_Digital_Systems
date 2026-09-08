"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { readActividadForm } from "@/lib/validation/actividad";

export interface MateriasActionState {
  error?: string;
  success?: boolean;
  id?: string;
}

async function verifyGrupoIsMine(admin: ReturnType<typeof createAdminClient>, grupoId: string, tutorId: string) {
  const { data: grupo } = await admin.from("grupos").select("tutor_id").eq("id", grupoId).single();
  return Boolean(grupo && grupo.tutor_id === tutorId);
}

export async function addMateriaToGrupoAction(formData: FormData): Promise<MateriasActionState> {
  const caller = await requireRole("tutor");

  const grupoId = String(formData.get("grupo_id") ?? "");
  const materiaId = String(formData.get("materia_id") ?? "");
  if (!grupoId || !materiaId) return { error: "Elige el grupo y la materia." };

  const admin = createAdminClient();
  if (!(await verifyGrupoIsMine(admin, grupoId, caller.id))) return { error: "Ese grupo no es tuyo." };

  const { data, error } = await admin
    .from("grupo_materias")
    .insert({ grupo_id: grupoId, materia_id: materiaId, tutor_id: caller.id })
    .select("id")
    .single();

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) return { error: "Ese grupo ya tiene esa materia." };
    console.error("Failed to add materia to grupo:", error);
    return { error: "No se pudo agregar la materia." };
  }

  revalidatePath("/tutores/materias");
  return { success: true, id: data.id };
}

export async function removeMateriaFromGrupoAction(formData: FormData): Promise<MateriasActionState> {
  const caller = await requireRole("tutor");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta la materia a quitar." };

  const admin = createAdminClient();
  const { data: existing } = await admin.from("grupo_materias").select("tutor_id").eq("id", id).single();
  if (!existing || existing.tutor_id !== caller.id) return { error: "Esa materia no es tuya." };

  const { error } = await admin.from("grupo_materias").delete().eq("id", id);
  if (error) {
    console.error("Failed to remove materia from grupo:", error);
    return { error: "No se pudo quitar la materia." };
  }

  revalidatePath("/tutores/materias");
  return { success: true };
}

export async function createActividadAction(formData: FormData): Promise<MateriasActionState> {
  const caller = await requireRole("tutor");

  const grupoId = String(formData.get("grupo_id") ?? "");
  const materiaId = String(formData.get("materia_id") ?? "");
  if (!grupoId || !materiaId) return { error: "Falta el grupo o la materia." };

  const parsed = readActividadForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const admin = createAdminClient();
  if (!(await verifyGrupoIsMine(admin, grupoId, caller.id))) return { error: "Ese grupo no es tuyo." };

  const { error } = await admin.from("actividades").insert({
    grupo_id: grupoId,
    materia_id: materiaId,
    tutor_id: caller.id,
    titulo: parsed.data.titulo,
    descripcion: parsed.data.descripcion,
    fecha_limite: parsed.data.fechaLimite,
    recurso_link: parsed.data.recursoLink,
  });
  if (error) {
    console.error("Failed to create actividad:", error);
    return { error: "No se pudo crear la actividad." };
  }

  revalidatePath("/tutores/materias");
  return { success: true };
}

export async function updateActividadAction(formData: FormData): Promise<MateriasActionState> {
  const caller = await requireRole("tutor");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta la actividad a actualizar." };

  const parsed = readActividadForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const admin = createAdminClient();
  const { data: existing } = await admin.from("actividades").select("tutor_id").eq("id", id).single();
  if (!existing || existing.tutor_id !== caller.id) return { error: "Esa actividad no es tuya." };

  const { error } = await admin
    .from("actividades")
    .update({
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion,
      fecha_limite: parsed.data.fechaLimite,
      recurso_link: parsed.data.recursoLink,
    })
    .eq("id", id);
  if (error) {
    console.error("Failed to update actividad:", error);
    return { error: "No se pudo actualizar la actividad." };
  }

  revalidatePath("/tutores/materias");
  return { success: true };
}

export async function deleteActividadAction(formData: FormData): Promise<MateriasActionState> {
  const caller = await requireRole("tutor");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta la actividad a eliminar." };

  const admin = createAdminClient();
  const { data: existing } = await admin.from("actividades").select("tutor_id").eq("id", id).single();
  if (!existing || existing.tutor_id !== caller.id) return { error: "Esa actividad no es tuya." };

  const { error } = await admin.from("actividades").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete actividad:", error);
    return { error: "No se pudo eliminar la actividad." };
  }

  revalidatePath("/tutores/materias");
  return { success: true };
}

export async function createHiloAction(formData: FormData): Promise<MateriasActionState> {
  const caller = await requireRole("tutor");

  const grupoId = String(formData.get("grupo_id") ?? "");
  const materiaId = String(formData.get("materia_id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!grupoId || !materiaId || !titulo) return { error: "Falta el título del hilo." };

  const admin = createAdminClient();
  if (!(await verifyGrupoIsMine(admin, grupoId, caller.id))) return { error: "Ese grupo no es tuyo." };

  const { data, error } = await admin
    .from("foro_hilos")
    .insert({ grupo_id: grupoId, materia_id: materiaId, tutor_id: caller.id, autor_id: caller.id, titulo })
    .select("id")
    .single();
  if (error) {
    console.error("Failed to create hilo:", error);
    return { error: "No se pudo crear el hilo." };
  }

  revalidatePath(`/tutores/materias`);
  return { success: true, id: data.id };
}

export async function createMensajeAction(formData: FormData): Promise<MateriasActionState> {
  const caller = await requireRole("tutor");

  const hiloId = String(formData.get("hilo_id") ?? "");
  const mensaje = String(formData.get("mensaje") ?? "").trim();
  if (!hiloId || !mensaje) return { error: "Escribe un mensaje." };

  const admin = createAdminClient();
  const { data: hilo } = await admin.from("foro_hilos").select("tutor_id").eq("id", hiloId).single();
  if (!hilo || hilo.tutor_id !== caller.id) return { error: "Ese hilo no es de un grupo tuyo." };

  const { error } = await admin
    .from("foro_mensajes")
    .insert({ hilo_id: hiloId, tutor_id: caller.id, autor_id: caller.id, mensaje });
  if (error) {
    console.error("Failed to create mensaje:", error);
    return { error: "No se pudo enviar el mensaje." };
  }

  revalidatePath(`/tutores/materias`);
  return { success: true };
}

export async function deleteHiloAction(formData: FormData): Promise<MateriasActionState> {
  const caller = await requireRole("tutor");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el hilo a eliminar." };

  const admin = createAdminClient();
  const { data: existing } = await admin.from("foro_hilos").select("tutor_id").eq("id", id).single();
  if (!existing || existing.tutor_id !== caller.id) return { error: "Ese hilo no es tuyo." };

  const { error } = await admin.from("foro_hilos").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete hilo:", error);
    return { error: "No se pudo eliminar el hilo." };
  }

  revalidatePath(`/tutores/materias`);
  return { success: true };
}

export async function deleteMensajeAction(formData: FormData): Promise<MateriasActionState> {
  const caller = await requireRole("tutor");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el mensaje a eliminar." };

  const admin = createAdminClient();
  const { data: existing } = await admin.from("foro_mensajes").select("tutor_id").eq("id", id).single();
  if (!existing || existing.tutor_id !== caller.id) return { error: "Ese mensaje no es de un hilo tuyo." };

  const { error } = await admin.from("foro_mensajes").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete mensaje:", error);
    return { error: "No se pudo eliminar el mensaje." };
  }

  revalidatePath(`/tutores/materias`);
  return { success: true };
}

export async function createRecursoAction(formData: FormData): Promise<MateriasActionState> {
  const caller = await requireRole("tutor");

  const grupoId = String(formData.get("grupo_id") ?? "");
  const materiaId = String(formData.get("materia_id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "link");
  const url = String(formData.get("url") ?? "").trim();
  if (!grupoId || !materiaId || !titulo || !url) return { error: "Completa el título y el link del recurso." };
  if (tipo !== "pdf" && tipo !== "link") return { error: "Tipo de recurso inválido." };

  const admin = createAdminClient();
  if (!(await verifyGrupoIsMine(admin, grupoId, caller.id))) return { error: "Ese grupo no es tuyo." };

  const { error } = await admin
    .from("materia_recursos")
    .insert({ grupo_id: grupoId, materia_id: materiaId, tutor_id: caller.id, titulo, tipo, url });
  if (error) {
    console.error("Failed to create recurso:", error);
    return { error: "No se pudo agregar el recurso." };
  }

  revalidatePath("/tutores/materias");
  return { success: true };
}

export async function deleteRecursoAction(formData: FormData): Promise<MateriasActionState> {
  const caller = await requireRole("tutor");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el recurso a eliminar." };

  const admin = createAdminClient();
  const { data: existing } = await admin.from("materia_recursos").select("tutor_id").eq("id", id).single();
  if (!existing || existing.tutor_id !== caller.id) return { error: "Ese recurso no es tuyo." };

  const { error } = await admin.from("materia_recursos").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete recurso:", error);
    return { error: "No se pudo eliminar el recurso." };
  }

  revalidatePath("/tutores/materias");
  return { success: true };
}
