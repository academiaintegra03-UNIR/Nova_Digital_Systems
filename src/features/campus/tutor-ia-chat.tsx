import { AsistenteChat } from "@/components/shared/asistente-chat";

const SUGERENCIAS = ["Dame una pista", "Explícamelo de otra forma", "Muéstrame un ejemplo"];

export function TutorIaChat() {
  return (
    <AsistenteChat
      endpoint="/api/tutor-ia"
      saludo="¡Hola! Soy tu tutor con IA. Cuéntame qué tema o ejercicio estás trabajando y lo resolvemos paso a paso."
      aviso="El tutor con IA puede cometer errores. Si tienes dudas, consulta con tu tutor humano."
      pie="Respuestas generadas por IA."
      sugerencias={SUGERENCIAS}
    />
  );
}
