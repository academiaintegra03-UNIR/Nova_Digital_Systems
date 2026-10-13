"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createUserAction } from "@/app/admin/usuarios/actions";
import { roleOptions } from "@/lib/data/roles";
import { documentTypes } from "@/lib/data/document-types";
import type { Colegio } from "@/lib/types/panels";
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

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

const NO_COLEGIO = "__none__";
const NO_DOC_TYPE = "__none__";

export function CreateUserDialog({ colegios }: { colegios: Colegio[] }) {
  const [open, setOpen] = React.useState(false);
  const [role, setRole] = React.useState("");
  const [colegioId, setColegioId] = React.useState("");
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
      const result = await createUserAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Usuario creado — ya puede iniciar sesión.");
      setOpen(false);
      setRole("");
      setColegioId("");
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setError(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">+ Crear usuario</Button>
      </DialogTrigger>
      <DialogContent>
        <form ref={formRef} onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Crear usuario</DialogTitle>
            <DialogDescription>
              Crea una cuenta real en Supabase. Podrá iniciar sesión de inmediato con el correo y la
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
              <Label htmlFor="new-user-nombre">Nombre completo</Label>
              <Input id="new-user-nombre" name="nombre" required disabled={isPending} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-user-email">Correo</Label>
              <Input id="new-user-email" name="email" type="email" required disabled={isPending} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-user-telefono">Teléfono (opcional)</Label>
              <Input id="new-user-telefono" name="telefono" type="tel" disabled={isPending} />
            </div>

            <div className="grid grid-cols-[1fr_1.4fr] gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-user-doc-tipo">Tipo de documento</Label>
                <input type="hidden" name="tipo_documento" value={tipoDocumento} />
                <Select
                  value={tipoDocumento || NO_DOC_TYPE}
                  onValueChange={(next) => setTipoDocumento(next === NO_DOC_TYPE ? "" : next)}
                  disabled={isPending}
                >
                  <SelectTrigger id="new-user-doc-tipo" className="w-full">
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
                <Label htmlFor="new-user-doc-numero">Número de documento</Label>
                <Input id="new-user-doc-numero" name="numero_documento" disabled={isPending} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-user-password">Contraseña temporal</Label>
              <div className="flex gap-2">
                <Input
                  id="new-user-password"
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
              <p className="text-xs text-muted-foreground">
                Compártela con el usuario por un canal seguro — no se reenvía por correo.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-user-role">Rol</Label>
              <input type="hidden" name="role" value={role} />
              <Select
                value={role}
                onValueChange={(next) => {
                  setRole(next);
                  if (next !== "estudiante") setColegioId("");
                }}
                disabled={isPending}
              >
                <SelectTrigger id="new-user-role" className="w-full">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.role} value={option.role}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {role === "estudiante" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-user-colegio">Colegio</Label>
                <input type="hidden" name="colegio_id" value={colegioId} />
                <Select
                  value={colegioId || NO_COLEGIO}
                  onValueChange={(next) => setColegioId(next === NO_COLEGIO ? "" : next)}
                  disabled={isPending}
                >
                  <SelectTrigger id="new-user-colegio" className="w-full">
                    <SelectValue placeholder="Selecciona un colegio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_COLEGIO}>Sin colegio (independiente)</SelectItem>
                    {colegios.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="flex items-start gap-2">
              <Checkbox
                id="new-user-acepta-datos"
                checked={aceptaDatos}
                onCheckedChange={(checked) => setAceptaDatos(checked === true)}
                disabled={isPending}
                className="mt-0.5"
              />
              <Label htmlFor="new-user-acepta-datos" className="text-xs font-normal text-muted-foreground">
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
              {isPending ? "Creando..." : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
