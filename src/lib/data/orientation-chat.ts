export const orientationAssistantName = "Álex";
export const orientationAssistantRole = "Asistente de orientación (IA)";

export const orientationGreeting =
  "¡Hola! Soy Álex, el asistente de orientación de Nova Digital Studio Systems. Puedo ayudarte a ubicar el programa adecuado o resolver dudas rápidas sobre matrícula. ¿En qué te puedo ayudar?";

export const orientationWarning =
  "Álex puede cometer errores y no sustituye a un asesor humano. Para datos personales o pagos, un miembro del equipo te contacta directamente.";

export interface OrientationQuickReply {
  label: string;
  href: string;
}

export const orientationQuickReplies: OrientationQuickReply[] = [
  { label: "Ver programas", href: "/programas" },
  { label: "Precios y planes", href: "/planes-precios" },
];
