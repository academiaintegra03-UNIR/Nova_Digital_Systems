"use client";

import * as React from "react";
import Link from "next/link";
import { CreditCard, Lock, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { startCheckoutAction } from "@/app/checkout/[planId]/actions";
import { documentTypes } from "@/lib/data/document-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const NO_DOC_TYPE = "__none__";

function IconField({
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { icon: typeof User }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn("pl-8", className)} {...props} />
    </div>
  );
}

export function CheckoutForm({ planId }: { planId: string }) {
  const [error, setError] = React.useState<string>();
  const [tipoDocumento, setTipoDocumento] = React.useState("");
  const [aceptaDatos, setAceptaDatos] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    setError(undefined);
    if (!aceptaDatos) {
      setError("Debes aceptar el tratamiento de tus datos personales para continuar.");
      return;
    }
    startTransition(async () => {
      const result = await startCheckoutAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    });
  }

  // Sin esto, React resetea los campos no controlados apenas la función
  // termina (aunque devolvamos { error }), y el usuario pierde lo que
  // escribió cada vez que falla una validación.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSubmit(new FormData(e.currentTarget));
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">
          Tus datos viajan cifrados. Pagas directo en la plataforma de Wompi — nunca vemos ni guardamos los
          datos de tu tarjeta o cuenta.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" name="plan_id" value={planId} />

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="checkout-nombre">Nombre completo</Label>
          <IconField icon={User} id="checkout-nombre" name="nombre" required disabled={isPending} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="checkout-email">Correo</Label>
          <IconField
            icon={Mail}
            id="checkout-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="checkout-telefono">Teléfono</Label>
          <IconField
            icon={Phone}
            id="checkout-telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-[1fr_1.4fr] gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="checkout-doc-tipo">Documento</Label>
            <input type="hidden" name="tipo_documento" value={tipoDocumento} />
            <Select
              value={tipoDocumento || NO_DOC_TYPE}
              onValueChange={(next) => setTipoDocumento(next === NO_DOC_TYPE ? "" : next)}
              disabled={isPending}
            >
              <SelectTrigger id="checkout-doc-tipo" className="w-full">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_DOC_TYPE}>Sin especificar</SelectItem>
                {documentTypes.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="checkout-doc-numero">Número</Label>
            <IconField icon={CreditCard} id="checkout-doc-numero" name="numero_documento" disabled={isPending} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="checkout-password">Contraseña</Label>
          <IconField
            icon={Lock}
            id="checkout-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">La usarás para iniciar sesión después de pagar.</p>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="checkout-acepta-datos"
            checked={aceptaDatos}
            onCheckedChange={(checked) => setAceptaDatos(checked === true)}
            disabled={isPending}
            className="mt-0.5"
          />
          <Label htmlFor="checkout-acepta-datos" className="text-xs font-normal text-muted-foreground">
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

        <Button type="submit" size="lg" className="w-full gap-2" disabled={isPending}>
          {isPending ? (
            "Conectando con Wompi..."
          ) : (
            <>
              <Lock className="size-4" aria-hidden="true" /> Continuar al pago seguro
            </>
          )}
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          Al continuar aceptas ser dirigido a Wompi, una pasarela de pago regulada, para completar tu compra.
        </p>
      </form>
    </div>
  );
}
