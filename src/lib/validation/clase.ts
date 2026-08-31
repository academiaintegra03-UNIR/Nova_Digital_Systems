import "server-only";

export interface ClaseFormData {
  grupoId: string;
  materiaId: string;
  nombre: string;
  scheduledAt: string;
  durationMinutes: number | null;
  meetingLink: string | null;
  recordingLink: string | null;
}

/** Campos comunes a crear/editar una clase, sin tutor_id — admin lo deja
 * elegible en el formulario, el tutor siempre lo fuerza a sí mismo. */
export function readClaseForm(formData: FormData): { error: string } | { data: ClaseFormData } {
  const grupoId = String(formData.get("grupo_id") ?? "");
  const materiaId = String(formData.get("materia_id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const scheduledAtRaw = String(formData.get("scheduled_at") ?? "").trim();
  const durationRaw = String(formData.get("duration_minutes") ?? "").trim();
  const meetingLink = String(formData.get("meeting_link") ?? "").trim();
  const recordingLink = String(formData.get("recording_link") ?? "").trim();

  if (!grupoId || !materiaId || !nombre || !scheduledAtRaw) {
    return { error: "Completa el grupo, la materia, el nombre y la fecha." };
  }

  const scheduledAt = new Date(scheduledAtRaw);
  if (Number.isNaN(scheduledAt.getTime())) return { error: "La fecha no es válida." };

  const durationMinutes = durationRaw ? Number(durationRaw) : null;
  if (durationRaw && (!Number.isFinite(durationMinutes) || (durationMinutes as number) <= 0)) {
    return { error: "La duración debe ser un número de minutos mayor a 0." };
  }

  return {
    data: {
      grupoId,
      materiaId,
      nombre,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes,
      meetingLink: meetingLink || null,
      recordingLink: recordingLink || null,
    },
  };
}
