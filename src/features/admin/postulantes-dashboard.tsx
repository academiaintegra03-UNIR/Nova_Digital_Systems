"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Mail, MailWarning } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { notificarPostulanteAction } from "@/app/admin/postulantes/actions";

export interface PostulanteAdminRow {
  id: string;
  createdAt: string;
  nombre: string;
  email: string;
  telefono: string | null;
  notificado: boolean;
  notificadoEn: string | null;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Acción de un solo sentido: crea la cuenta y envía la contraseña por
 * correo. Pide confirmación explícita (no es un toggle reversible como un
 * estado cualquiera) y, una vez hecha, la fila ya no vuelve a mostrar el
 * botón — solo el resultado. */
function NotificarAccion({ postulante }: { postulante: PostulanteAdminRow }) {
  const [open, setOpen] = React.useState(false);
  const [notificado, setNotificado] = React.useState(postulante.notificado);
  const [notificadoEn, setNotificadoEn] = React.useState(postulante.notificadoEn);
  const [correoFallido, setCorreoFallido] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [isPending, startTransition] = React.useTransition();

  function confirmar() {
    setError(undefined);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", postulante.id);
      const result = await notificarPostulanteAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setNotificado(true);
      setNotificadoEn(new Date().toISOString());
      setCorreoFallido(!!result.cuentaSinCorreo);
      setOpen(false);
      if (result.cuentaSinCorreo) {
        toast.warning("Cuenta creada, pero el correo no se pudo enviar", {
          description: "Ve a Usuarios para restablecerle la contraseña y avisarle directo.",
          duration: 8000,
        });
      } else {
        toast.success("Cuenta creada y correo enviado");
      }
    });
  }

  if (notificado) {
    return (
      <div className="flex flex-col gap-1">
        <StatusBadge tone={correoFallido ? "warning" : "success"}>
          {correoFallido ? (
            <span className="flex items-center gap-1">
              <MailWarning className="size-3" /> Cuenta creada, correo pendiente
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Mail className="size-3" /> Notificado
            </span>
          )}
        </StatusBadge>
        {notificadoEn ? <span className="text-xs text-muted-foreground">{formatFecha(notificadoEn)}</span> : null}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="cta" size="sm">
          Notificar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Notificar a {postulante.nombre}?</DialogTitle>
          <DialogDescription>
            Se va a crear una cuenta de estudiante para <strong>{postulante.email}</strong> con una contraseña
            generada, y se le va a enviar por correo junto con el acceso a la prueba gratuita. Esta acción no se
            puede repetir ni deshacer.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="button" variant="cta" onClick={confirmar} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Sí, notificar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PostulantesDashboard({ postulantes }: { postulantes: PostulanteAdminRow[] }) {
  const [busqueda, setBusqueda] = React.useState("");

  const filtrados = React.useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return postulantes;
    return postulantes.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.telefono ?? "").includes(q)
    );
  }, [postulantes, busqueda]);

  const total = postulantes.length;
  const notificados = postulantes.filter((p) => p.notificado).length;

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Postulantes" value={String(total)} />
        <StatCard label="Ya notificados" value={String(notificados)} />
        <StatCard label="Pendientes" value={String(total - notificados)} />
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <Input
            placeholder="Buscar por nombre, correo o WhatsApp..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {filtrados.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {total === 0 ? "Todavía no hay postulantes." : "Ningún postulante coincide con la búsqueda."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-muted-foreground">{formatFecha(p.createdAt)}</TableCell>
                    <TableCell className="font-semibold">{p.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{p.email}</TableCell>
                    <TableCell className="text-muted-foreground">{p.telefono ?? "—"}</TableCell>
                    <TableCell>
                      <NotificarAccion postulante={p} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
