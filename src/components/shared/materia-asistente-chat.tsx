"use client";

import * as React from "react";
import { toast } from "sonner";
import { Bot, Loader2, Send, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

const SALUDO_INICIAL: ChatMessage = {
  role: "model",
  text: "¡Hola! Soy el asistente de esta materia. Pregúntame lo que necesites entender mejor — te ayudo con ejemplos y explicaciones, sin reemplazar a tu tutor.",
};

export function MateriaAsistenteChat({ grupoMateriaId }: { grupoMateriaId: string }) {
  const [mensajes, setMensajes] = React.useState<ChatMessage[]>([SALUDO_INICIAL]);
  const [input, setInput] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || isPending) return;

    const historial = [...mensajes, { role: "user" as const, text: texto }];
    setMensajes(historial);
    setInput("");

    startTransition(async () => {
      try {
        const res = await fetch(`/api/materias/${grupoMateriaId}/asistente`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historial }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "No se pudo enviar el mensaje.");
          return;
        }
        setMensajes((m) => [...m, { role: "model", text: data.reply }]);
      } catch {
        toast.error("No se pudo enviar el mensaje. Revisa tu conexión.");
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <Card className="mb-4">
        <CardContent className="flex min-h-72 flex-col gap-3">
          {mensajes.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-line",
                m.role === "model" ? "self-start bg-secondary text-secondary-foreground" : "self-end bg-primary text-white"
              )}
            >
              {m.text}
            </div>
          ))}
          {isPending ? (
            <div className="flex items-center gap-1.5 self-start text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> Escribiendo...
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="mb-3 flex items-start gap-1.5 rounded-lg bg-warning-foreground px-3 py-2 text-xs font-semibold text-warning">
        <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>Este asistente puede cometer errores — si tienes dudas, confírmalas con tu tutor.</span>
      </div>

      <form onSubmit={enviar} className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta..."
          rows={2}
          disabled={isPending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={isPending || !input.trim()} aria-label="Enviar">
          {isPending ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </form>
      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Bot className="size-3.5" aria-hidden="true" /> Respuestas generadas por IA, específicas de esta materia.
      </p>
    </div>
  );
}
