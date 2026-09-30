import type { Metadata } from "next";
import { AlexChatPage } from "@/features/marketing/alex-chat-page";

export const metadata: Metadata = { title: "Habla con Álex" };

export default function AlexPage() {
  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-10 text-center sm:px-8">
        <div className="mb-2 text-xs font-bold tracking-wide text-glacier-strong uppercase">
          Asistente de orientación con IA
        </div>
        <h1 className="mb-2.5 text-3xl font-extrabold text-heading">Habla con Álex</h1>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          Cuéntale el nivel, la materia o el examen que te preocupa y te ayuda a identificar el programa
          adecuado antes de coordinar una sesión diagnóstica con el profesor.
        </p>
      </div>
      <AlexChatPage />
    </>
  );
}
