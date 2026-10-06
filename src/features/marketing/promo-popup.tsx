"use client";

import * as React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { postularPruebaGratuitaAction } from "@/features/marketing/promo-popup-actions";

/** Se muestra una sola vez por sesión del navegador, para no molestar en cada página. */
const SESSION_KEY = "nova-promo-popup-shown";
const OPEN_DELAY_MS = 1200;

const initialForm = { nombre: "", email: "", telefono: "" };

export function PromoPopup() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // sessionStorage no disponible (navegación privada, etc.): mostramos de todas formas.
    }

    const timer = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Ignorar: a lo sumo se vuelve a mostrar en la próxima página.
      }
    }, OPEN_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  function update<K extends keyof typeof initialForm>(field: K, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await postularPruebaGratuitaAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSent(true);
      toast.success("¡Postulación recibida!", { description: "Te avisaremos apenas lancemos la prueba gratuita." });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-cta">
            <Sparkles className="size-5" />
            <span className="text-xs font-semibold tracking-wide uppercase">Próximamente</span>
          </div>
          <DialogTitle className="text-xl">Vamos a lanzar una prueba gratuita</DialogTitle>
          <DialogDescription>
            Postúlate ahora y serás de los primeros en recibir acceso gratuito en cuanto la habilitemos.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <Alert className="border-none bg-success-foreground">
            <AlertDescription className="font-semibold text-success">
              ¡Listo! Quedaste en la lista — te escribiremos en cuanto esté disponible.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3.5">
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="promo-nombre">Nombre completo</Label>
                <Input
                  id="promo-nombre"
                  name="nombre"
                  required
                  value={form.nombre}
                  onChange={(e) => update("nombre", e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="promo-email">Correo electrónico</Label>
                <Input
                  id="promo-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="promo-telefono">WhatsApp (opcional)</Label>
                <Input
                  id="promo-telefono"
                  name="telefono"
                  value={form.telefono}
                  onChange={(e) => update("telefono", e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                Ahora no
              </Button>
              <Button type="submit" variant="cta" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Postularme
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
