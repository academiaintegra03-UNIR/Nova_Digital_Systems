"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle, SendHorizontal, TriangleAlert, X } from "lucide-react";
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

export function OrientationChatWidget() {
  const [open, setOpen] = React.useState(false);
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
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {open ? (
        <div className="mb-3 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center gap-2.5 border-b border-border bg-primary px-4 py-3">
            <Avatar className="size-9 shrink-0">
              <AvatarFallback className="bg-primary font-bold text-white">
                {orientationAssistantName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-white">{orientationAssistantName}</div>
              <div className="truncate text-xs text-on-primary-muted">{orientationAssistantRole}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-on-primary/10 hover:text-white"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div ref={scrollRef} className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4">
            <div className="max-w-[85%] self-start rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-secondary-foreground">
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
                  "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                  m.role === "model"
                    ? "self-start bg-secondary text-secondary-foreground"
                    : "self-end bg-primary text-white"
                )}
              >
                {m.text}
              </div>
            ))}

            {isPending ? (
              <div className="flex max-w-[85%] items-center gap-1 self-start rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-secondary-foreground">
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
              <div className="max-w-[85%] self-start rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-secondary-foreground">
                Llegamos al límite de este chat. Continúa por WhatsApp o el formulario de Contacto para
                seguir con el equipo.
              </div>
            ) : null}
          </div>

          {WHATSAPP_LINK && messages.length >= 2 ? (
            <div className="border-t border-border px-4 py-3">
              <Button asChild className="w-full">
                <Link href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  Consultar disponibilidad por WhatsApp
                </Link>
              </Button>
              <p className="mt-1.5 text-center text-xs text-muted-foreground">
                Habla directamente con el profesor para confirmar modalidad, horario y sesión diagnóstica.
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-3">
            {orientationQuickReplies.map((q) => (
              <Button key={q.href} variant="outline" size="sm" className="rounded-full" asChild>
                <Link href={q.href}>{q.label}</Link>
              </Button>
            ))}
          </div>

          {limitReached ? null : (
            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribe tu pregunta..."
                aria-label="Mensaje para Álex"
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={isPending}
                className="h-9"
              />
              <Button
                type="submit"
                size="icon"
                variant="cta"
                disabled={isPending || !draft.trim()}
                className="size-9 shrink-0"
              >
                <SendHorizontal className="size-4" aria-hidden="true" />
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat de orientación" : "Abrir chat de orientación con Álex"}
        aria-expanded={open}
        className="ml-auto flex size-14 items-center justify-center rounded-full bg-cta text-cta-foreground shadow-lg hover:bg-cta-hover"
      >
        {open ? <X className="size-6" aria-hidden="true" /> : <MessageCircle className="size-6" aria-hidden="true" />}
      </button>
    </div>
  );
}
