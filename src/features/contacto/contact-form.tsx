"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sendContactMessageAction } from "@/app/(marketing)/contacto/actions";

const initialForm = { name: "", email: "", phone: "", message: "" };

export function ContactForm() {
  const [form, setForm] = React.useState(initialForm);
  const [sent, setSent] = React.useState(false);
  const [whatsappLink, setWhatsappLink] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [aceptaDatos, setAceptaDatos] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  function update<K extends keyof typeof initialForm>(field: K, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!aceptaDatos) {
      setError("Debes aceptar el tratamiento de tus datos personales para continuar.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await sendContactMessageAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setWhatsappLink(result.whatsappLink ?? null);
      setSent(true);
      toast.success("Mensaje enviado", { description: "Te contactaremos pronto." });
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <Alert className="border-none bg-success-foreground">
          <AlertDescription className="font-semibold text-success">
            ¡Gracias! Recibimos tu mensaje y te contactaremos en menos de 24 horas.
          </AlertDescription>
        </Alert>
        {/* WhatsApp no deja enviar mensajes desde el servidor sin la API de Meta:
            se abre el chat con los datos ya escritos y el visitante lo envía. */}
        {whatsappLink ? (
          <Button variant="outline" asChild>
            <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" />
              Enviar también por WhatsApp
            </Link>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-name">Nombre completo</Label>
        <Input
          id="contact-name"
          name="name"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-email">Correo electrónico</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-phone">WhatsApp</Label>
        <Input id="contact-phone" name="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Mensaje</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
        />
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="contact-acepta-datos"
          checked={aceptaDatos}
          onCheckedChange={(checked) => setAceptaDatos(checked === true)}
          disabled={isPending}
          className="mt-0.5"
        />
        <Label htmlFor="contact-acepta-datos" className="text-xs font-normal text-muted-foreground">
          Acepto el tratamiento de mis datos personales conforme a la{" "}
          <Link
            href="/politica-de-tratamiento-de-datos"
            target="_blank"
            className="underline hover:text-foreground"
          >
            Política de Tratamiento de Datos
          </Link>
          .
        </Label>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Enviar mensaje
      </Button>
    </form>
  );
}
