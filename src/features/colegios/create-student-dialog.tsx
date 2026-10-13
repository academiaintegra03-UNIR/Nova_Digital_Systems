"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createStudentAction } from "@/app/colegios-panel/estudiantes/actions";
import { documentTypes } from "@/lib/data/document-types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NO_DOC_TYPE = "__none__";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export function CreateStudentDialog({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [tipoDocumento, setTipoDocumento] = React.useState("");
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
      const result = await createStudentAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Estudiante creado — ya puede iniciar sesión.");
      setOpen(false);
      setPassword("");
      setTipoDocumento("");
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
        <Button size="sm" disabled={disabled} title={disabled ? "Ya usaste todo tu cupo" : undefined}>
          + Crear estudiante
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form ref={formRef} onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Crear estudiante</DialogTitle>
            <DialogDescription>
              Crea la cuenta de tu estudiante — podrá iniciar sesión de inmediato con el correo y la
              contraseña que definas aquí.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="student-nombre">Nombre completo</Label>
              <Input id="student-nombre" name="nombre" required disabled={isPending} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="student-email">Correo</Label>
              <Input id="student-email" name="email" type="email" required disabled={isPending} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="student-telefono">Teléfono (opcional)</Label>
              <Input id="student-telefono" name="telefono" type="tel" disabled={isPending} />
            </div>

            <div className="grid grid-cols-[1fr_1.4fr] gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="student-doc-tipo">Tipo de documento</Label>
                <input type="hidden" name="tipo_documento" value={tipoDocumento} />
                <Select
                  value={tipoDocumento || NO_DOC_TYPE}
                  onValueChange={(next) => setTipoDocumento(next === NO_DOC_TYPE ? "" : next)}
                  disabled={isPending}
                >
                  <SelectTrigger id="student-doc-tipo" className="w-full">
                    <SelectValue placeholder="Selecciona" />
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="student-doc-numero">Número de documento</Label>
                <Input id="student-doc-numero" name="numero_documento" disabled={isPending} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="student-password">Contraseña temporal</Label>
              <div className="flex gap-2">
                <Input
                  id="student-password"
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
              <p className="text-xs text-muted-foreground">Compártela con el estudiante por un canal seguro.</p>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="student-acepta-datos"
                checked={aceptaDatos}
                onCheckedChange={(checked) => setAceptaDatos(checked === true)}
                disabled={isPending}
                className="mt-0.5"
              />
              <Label htmlFor="student-acepta-datos" className="text-xs font-normal text-muted-foreground">
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
