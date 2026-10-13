"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { inviteGuardianAction } from "@/app/colegios-panel/estudiantes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export function InviteGuardianDialog({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [open, setOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [aceptaDatos, setAceptaDatos] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [isPending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(undefined);
    if (!aceptaDatos) {
      setError("Debes confirmar el tratamiento de datos personales para continuar.");
      return;
    }
    startTransition(async () => {
      const result = await inviteGuardianAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Cuenta de acudiente creada.");
      setOpen(false);
      setPassword("");
      setAceptaDatos(false);
      formRef.current?.reset();
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
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); setError(undefined); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Invitar acudiente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form ref={formRef} onSubmit={onSubmit}>
          <input type="hidden" name="student_id" value={studentId} />
          <DialogHeader>
            <DialogTitle>Invitar acudiente</DialogTitle>
            <DialogDescription>
              Crea la cuenta del acudiente de <strong>{studentName}</strong> — podrá iniciar sesión de
              inmediato y ver su progreso.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guardian-nombre">Nombre completo</Label>
              <Input id="guardian-nombre" name="nombre" required disabled={isPending} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guardian-email">Correo</Label>
              <Input id="guardian-email" name="email" type="email" required disabled={isPending} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guardian-password">Contraseña temporal</Label>
              <div className="flex gap-2">
                <Input
                  id="guardian-password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  disabled={isPending}
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setPassword(generatePassword())}
                >
                  Generar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Compártela con el acudiente por un canal seguro.</p>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="guardian-acepta-datos"
                checked={aceptaDatos}
                onCheckedChange={(checked) => setAceptaDatos(checked === true)}
                disabled={isPending}
                className="mt-0.5"
              />
              <Label htmlFor="guardian-acepta-datos" className="text-xs font-normal text-muted-foreground">
                Confirmo que cuento con la autorización para tratar estos datos personales conforme a la{" "}
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
