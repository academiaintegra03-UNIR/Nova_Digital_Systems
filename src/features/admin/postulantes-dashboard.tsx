"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { marcarNotificadoAction } from "@/app/admin/postulantes/actions";

export interface PostulanteAdminRow {
  id: string;
  createdAt: string;
  nombre: string;
  email: string;
  telefono: string | null;
  notificado: boolean;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function FilaAccion({ postulante }: { postulante: PostulanteAdminRow }) {
  const [notificado, setNotificado] = React.useState(postulante.notificado);
  const [isPending, startTransition] = React.useTransition();

  function toggle() {
    const next = !notificado;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", postulante.id);
      formData.set("notificado", String(next));
      const result = await marcarNotificadoAction(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setNotificado(next);
      toast.success(next ? "Marcado como notificado" : "Marcado como pendiente");
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={isPending}>
      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
      {notificado ? "Marcar pendiente" : "Marcar notificado"}
    </Button>
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
                  <TableHead />
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
                      <StatusBadge tone={p.notificado ? "success" : "neutral"}>
                        {p.notificado ? "Notificado" : "Pendiente"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <FilaAccion postulante={p} />
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
