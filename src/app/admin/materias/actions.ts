"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireAnyRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";

export interface MateriaActionState {
  error?: string;
  success?: boolean;
  id?: string;
}

/** Admin o tutor — se reutiliza también desde el diálogo de programar
 * clase del tutor ("+ Crear nueva materia..."). */
export async function createMateriaAction(formData: FormData): Promise<MateriaActionState> {
  await requireAnyRole(["administrador", "tutor"]);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Ponle un nombre a la materia." };

  const admin = createAdminClient();
  const { data, error } = await admin.from("materias").insert({ name }).select("id").single();

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) return { error: "Ya existe una materia con ese nombre." };
    console.error("Failed to create materia:", error);
    return { error: "No se pudo crear la materia." };
  }

  revalidatePath("/admin/materias");
  revalidatePath("/tutores");
  return { success: true, id: data.id };
}

export async function updateMateriaAction(formData: FormData): Promise<MateriaActionState> {
  await requireRole("administrador");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return { error: "Faltan datos de la materia." };

  const admin = createAdminClient();
  const { error } = await admin.from("materias").update({ name }).eq("id", id);

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) return { error: "Ya existe una materia con ese nombre." };
    console.error("Failed to update materia:", error);
    return { error: "No se pudo actualizar la materia." };
  }

  revalidatePath("/admin/materias");
  return { success: true };
}

export async function deleteMateriaAction(formData: FormData): Promise<MateriaActionState> {
  await requireRole("administrador");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta la materia a eliminar." };

  const admin = createAdminClient();
  const { error } = await admin.from("materias").delete().eq("id", id);

  if (error) {
    // Bloqueada por FK (clases/grupo_materias/actividades referencian
    // materias sin on delete) si algo todavía la usa — mensaje claro en
    // vez del genérico de Postgres.
    if (error.message.toLowerCase().includes("foreign key")) {
      return { error: "No se puede eliminar: todavía está en uso (clases, grupos o actividades)." };
    }
    console.error("Failed to delete materia:", error);
    return { error: "No se pudo eliminar la materia." };
  }

  revalidatePath("/admin/materias");
  return { success: true };
}
