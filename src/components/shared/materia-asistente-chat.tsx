import { AsistenteChat } from "@/components/shared/asistente-chat";

export function MateriaAsistenteChat({ grupoMateriaId }: { grupoMateriaId: string }) {
  return (
    <AsistenteChat
      endpoint={`/api/materias/${grupoMateriaId}/asistente`}
      saludo="¡Hola! Soy el asistente de esta materia. Pregúntame lo que necesites entender mejor — te ayudo con ejemplos y explicaciones, sin reemplazar a tu tutor."
      aviso="Este asistente puede cometer errores — si tienes dudas, confírmalas con tu tutor."
      pie="Respuestas generadas por IA, específicas de esta materia."
    />
  );
}
