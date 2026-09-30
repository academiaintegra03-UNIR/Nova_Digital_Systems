"use client";

import * as React from "react";
import Link from "next/link";
import { SendHorizontal, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { ORIENTATION_CHAT_MAX_MESSAGE_LENGTH, ORIENTATION_CHAT_MAX_USER_MESSAGES } from "@/lib/chat-config";
import {
  orientationAssistantName,
  orientationAssistantRole,
  orientationGreeting,
  orientationQuickReplies,
  orientationWarning,
} from "@/lib/data/orientation-chat";

const MAX_MESSAGE_LENGTH = ORIENTATION_CHAT_MAX_MESSAGE_LENGTH;

const WHATSAPP_LINK = getWhatsAppLink(
  "Hola, vengo del chat de Álex en la página web y quiero agendar una sesión diagnóstica."
);

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

/**
 * Versión de página completa del mismo asistente del widget flotante
 * (misma API, mismo system prompt en /api/chat/orientacion) — solo con
 * más espacio en pantalla para quien prefiere una conversación larga en
 * vez del cuadro pequeño de la esquina.
 */
export function AlexChatPage() {
  const [draft, setDraft] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const limitReached = userMessageCount >= ORIENTATION_CHAT_MAX_USER_MESSAGES;

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, error, isPending]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || isPending || limitReached) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setDraft("");
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/chat/orientacion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "No pude responder en este momento. Intenta de nuevo.");
          return;
        }
        setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
      } catch {
        setError("No pude conectarme. Revisa tu conexión e intenta de nuevo.");
      }
    });
  }

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-4 py-10 sm:px-8 lg:grid-cols-[1fr_320px]">
      <div className="flex h-[75vh] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="flex items-center gap-3 border-b border-border bg-primary px-5 py-4">
          <Avatar className="size-11 shrink-0">
            <AvatarFallback className="bg-primary text-lg font-bold text-white">
              {orientationAssistantName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-bold text-white">{orientationAssistantName}</div>
            <div className="truncate text-xs text-on-primary-muted">{orientationAssistantRole}</div>
          </div>
        </div>

        <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5">
          <div className="max-w-[85%] self-start rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
            {orientationGreeting}
          </div>
          <div className="flex items-start gap-1.5 self-start rounded-lg bg-warning-foreground px-3 py-2 text-xs font-semibold text-warning">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{orientationWarning}</span>
          </div>

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap",
                m.role === "model" ? "self-start bg-secondary text-secondary-foreground" : "self-end bg-primary text-white"
              )}
            >
              {m.text}
            </div>
          ))}

          {isPending ? (
            <div className="flex max-w-[85%] items-center gap-1 self-start rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
              <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-current" />
            </div>
          ) : null}

          {error ? (
            <div className="flex items-start gap-1.5 self-start rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          {limitReached ? (
            <div className="max-w-[85%] self-start rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
              Llegamos al límite de este chat. Continúa por WhatsApp o el formulario de Contacto para seguir con
              el equipo.
            </div>
          ) : null}
        </div>

        {WHATSAPP_LINK && messages.length >= 2 ? (
          <div className="border-t border-border px-5 py-3.5">
            <Button asChild className="w-full">
              <Link href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                Consultar disponibilidad por WhatsApp
              </Link>
            </Button>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5 border-t border-border px-5 py-3.5">
          {orientationQuickReplies.map((q) => (
            <Button key={q.href} variant="outline" size="sm" className="rounded-full" asChild>
              <Link href={q.href}>{q.label}</Link>
            </Button>
          ))}
        </div>

        {limitReached ? null : (
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-4">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribe tu pregunta..."
              aria-label="Mensaje para Álex"
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={isPending}
              className="h-10"
            />
            <Button type="submit" size="icon" variant="cta" disabled={isPending || !draft.trim()} className="size-10 shrink-0">
              <SendHorizontal className="size-4" aria-hidden="true" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        )}
      </div>

      <div className="h-fit rounded-2xl bg-secondary p-5">
        <div className="mb-2 text-sm font-extrabold text-heading">¿Qué puede resolver Álex?</div>
        <ul className="flex flex-col gap-2 text-sm text-foreground/80">
          <li>• Ubicar el programa según grado, nivel o examen (Saber 11, admisión, cálculo).</li>
          <li>• Aclarar dudas rápidas sobre modalidad, ciudad y por dónde empezar.</li>
          <li>• Dejarte listo para coordinar la sesión diagnóstica con el profesor.</li>
        </ul>
        <div className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
          Álex es un asistente de orientación con IA, no un profesor ni un asesor humano. No procesa pagos ni
          guarda datos personales — para eso, WhatsApp o{" "}
          <Link href="/contacto" className="font-semibold text-secondary-foreground hover:underline">
            /contacto
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
