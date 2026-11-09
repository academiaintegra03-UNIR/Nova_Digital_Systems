"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InstitucionCombobox } from "@/components/shared/institucion-combobox";
import { postularPruebaGratuitaAction } from "@/features/marketing/promo-popup-actions";
import { PRUEBA_GRATUITA_POPUP_HASH } from "@/lib/data/nav";

const OPEN_DELAY_MS = 1200;

/**
 * Flag en memoria del módulo — no en sessionStorage. El layout de
 * (marketing) no se desmonta entre páginas, así que esto evita que el
 * popup reaparezca con cada clic interno... pero al recargar (F5) se
 * vuelve a cargar el JS desde cero, así que vuelve a mostrarse, que es lo
 * que se espera de un popup publicitario.
 */
let yaMostrado = false;

const initialForm = { nombre: "", email: "", telefono: "", colegio: "" };

export function PromoPopup() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [aceptaDatos, setAceptaDatos] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const pathname = usePathname();

  React.useEffect(() => {
    if (yaMostrado) return;

    const timer = setTimeout(() => {
      // Ya lo pudo haber abierto el ancla #prueba-gratuita.
      if (yaMostrado) return;
      yaMostrado = true;
      setOpen(true);
    }, OPEN_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  // Con el ancla #prueba-gratuita se abre siempre, aunque ya se haya
  // mostrado: es una invitación explícita (tarjeta de Recursos, carrusel de
  // la portada, enlaces en redes). Se revisa al cambiar de ruta (navegación
  // con <Link>), en hashchange y al hacer clic en un enlace al ancla de la
  // misma página: <Link> cambia el hash con pushState, que no dispara
  // hashchange, y si el hash ya era #prueba-gratuita tampoco cambia nada.
  React.useEffect(() => {
    function abrir() {
      yaMostrado = true;
      setOpen(true);
    }
    function abrirSiHayAncla() {
      if (window.location.hash === `#${PRUEBA_GRATUITA_POPUP_HASH}`) abrir();
    }
    function abrirAlHacerClic(e: MouseEvent) {
      const enlace = (e.target as Element | null)?.closest?.("a[href]");
      if (!(enlace instanceof HTMLAnchorElement)) return;
      const url = new URL(enlace.href);
      if (url.hash === `#${PRUEBA_GRATUITA_POPUP_HASH}` && url.pathname === window.location.pathname) abrir();
    }
    abrirSiHayAncla();
    window.addEventListener("hashchange", abrirSiHayAncla);
    document.addEventListener("click", abrirAlHacerClic);
    return () => {
      window.removeEventListener("hashchange", abrirSiHayAncla);
      document.removeEventListener("click", abrirAlHacerClic);
    };
  }, [pathname]);

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
      const result = await postularPruebaGratuitaAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSent(true);
      toast.success("¡Postulación recibida!", { description: "Te enviaremos tu acceso por correo." });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-cta">
            <Sparkles className="size-5" />
            <span className="text-xs font-semibold tracking-wide uppercase">Prueba gratuita</span>
          </div>
          <DialogTitle className="text-xl">Presenta gratis una prueba tipo Saber 11</DialogTitle>
          <DialogDescription>
            Postúlate y te enviaremos por correo tu acceso para presentarla y recibir tu informe de resultados.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <Alert className="border-none bg-success-foreground">
            <AlertDescription className="font-semibold text-success">
              ¡Listo! Recibimos tu postulación — te escribiremos al correo con tu acceso.
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
                <Label htmlFor="promo-telefono">WhatsApp</Label>
                <Input
                  id="promo-telefono"
                  name="telefono"
                  type="tel"
                  inputMode="numeric"
                  required
                  value={form.telefono}
                  onChange={(e) => update("telefono", e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="promo-colegio">Colegio o institución educativa</Label>
                <InstitucionCombobox
                  id="promo-colegio"
                  name="colegio"
                  value={form.colegio}
                  onChange={(colegio) => update("colegio", colegio)}
                  disabled={isPending}
                />
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="promo-acepta-datos"
                  checked={aceptaDatos}
                  onCheckedChange={(checked) => setAceptaDatos(checked === true)}
                  disabled={isPending}
                  className="mt-0.5"
                />
                <Label htmlFor="promo-acepta-datos" className="block text-xs leading-relaxed font-normal text-muted-foreground">
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
