"use client";

import { Download, FileText } from "lucide-react";
import type { InformeGrupoTutor } from "@/lib/types/panels";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/** Evita que Excel ejecute como fórmula un nombre que empiece por =, +, - o @. */
function celdaCsv(valor: string | number) {
  const texto = String(valor);
  const seguro = /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
  return `"${seguro.replace(/"/g, '""')}"`;
}

function descargarCsv(informe: InformeGrupoTutor) {
  const filas = [
    ["Estudiante", "Entregas", "Actividades", "Promedio"],
    ...informe.estudiantes.map((e) => [e.nombre, e.entregadas, informe.totalActividades, e.promedio ?? "Sin nota"]),
  ];
  // Punto y coma y BOM: es lo que Excel espera en configuración regional de Colombia.
  const csv = `﻿${filas.map((fila) => fila.map(celdaCsv).join(";")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `informe-${informe.grupoNombre}-${informe.materiaNombre}.csv`.toLowerCase().replace(/\s+/g, "-");
  enlace.click();
  URL.revokeObjectURL(url);
}

export function ReportsList({ informes }: { informes: InformeGrupoTutor[] }) {
  if (informes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
          <FileText className="mb-2 size-6" aria-hidden="true" />
          Los informes aparecen cuando publiques actividades en tus materias.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {informes.map((informe) => (
        <Card key={informe.clave}>
          <CardContent>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-heading">
                  {informe.grupoNombre} · {informe.materiaNombre}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {informe.totalActividades} {informe.totalActividades === 1 ? "actividad" : "actividades"} · Promedio del
                  grupo: <span className="font-data">{informe.promedioGrupo?.toFixed(1) ?? "sin notas"}</span>
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => descargarCsv(informe)}>
                <Download className="size-3.5" aria-hidden="true" /> Descargar CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Entregas</TableHead>
                    <TableHead>Promedio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {informe.estudiantes.map((e) => (
                    <TableRow key={e.studentId}>
                      <TableCell className="font-semibold">{e.nombre}</TableCell>
                      <TableCell className="font-data">
                        {e.entregadas} / {informe.totalActividades}
                      </TableCell>
                      <TableCell className="font-data">{e.promedio?.toFixed(1) ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
