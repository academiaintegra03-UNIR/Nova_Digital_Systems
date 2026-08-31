import "server-only";

export interface ActividadFormData {
  titulo: string;
  descripcion: string | null;
  fechaLimite: string | null;
  recursoLink: string | null;
}

export function readActividadForm(formData: FormData): { error: string } | { data: ActividadFormData } {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const fechaLimiteRaw = String(formData.get("fecha_limite") ?? "").trim();
  const recursoLink = String(formData.get("recurso_link") ?? "").trim();

  if (!titulo) return { error: "Ponle un título a la actividad." };

  let fechaLimite: string | null = null;
  if (fechaLimiteRaw) {
    const parsed = new Date(fechaLimiteRaw);
    if (Number.isNaN(parsed.getTime())) return { error: "La fecha límite no es válida." };
    fechaLimite = parsed.toISOString();
  }

  return {
    data: {
      titulo,
      descripcion: descripcion || null,
      fechaLimite,
      recursoLink: recursoLink || null,
    },
  };
}
