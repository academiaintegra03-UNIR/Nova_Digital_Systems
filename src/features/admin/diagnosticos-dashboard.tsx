"use client";

import * as React from "react";
import { BANCO_LABEL, type BancoId } from "@/lib/diagnostico/types";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface DiagnosticoAdminRow {
  id: string;
  createdAt: string;
  bancoId: string;
  estudianteNombre: string;
  estudianteEdad: number | null;
  colegio: string | null;
  puntajeGlobal: number;
  aciertos: number;
  totalPreguntas: number;
  enfoqueScore: number;
  perfilDominante: string | null;
  acudienteEmail: string | null;
  acudienteTelefono: string | null;
}

const TODOS = "__todos__";
const SIN_COLEGIO = "Sin colegio";
const DAYS_IN_TREND = 14;

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function bancoLabelCorto(bancoId: string): string {
  if (bancoId === "general") return "General";
  if (bancoId === "noveno") return "9°";
  if (bancoId === "decimo") return "10°";
  return bancoId;
}

/** Date.now() no puede llamarse directo en el cuerpo del componente
 * (regla de pureza del compilador de React) — misma solución ya usada en
 * /admin/ia (summarizeChatLogs) y en src/lib/clases.ts. */
function calcularTendencia(rows: DiagnosticoAdminRow[]) {
  const trend: { label: string; value: number }[] = [];
  for (let i = DAYS_IN_TREND - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    const count = rows.filter((r) => r.createdAt.slice(0, 10) === key).length;
    trend.push({ label: date.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" }), value: count });
  }
  return trend;
}

function calcularDistribucionPuntaje(rows: DiagnosticoAdminRow[]) {
  const buckets = [
    { label: "0-20%", min: 0, max: 20 },
    { label: "20-40%", min: 20, max: 40 },
    { label: "40-60%", min: 40, max: 60 },
    { label: "60-80%", min: 60, max: 80 },
    { label: "80-100%", min: 80, max: 101 },
  ];
  return buckets.map((b) => ({
    label: b.label,
    value: rows.filter((r) => r.puntajeGlobal >= b.min && r.puntajeGlobal < b.max).length,
  }));
}

function calcularPromedioPorColegio(rows: DiagnosticoAdminRow[]) {
  const porColegio = new Map<string, { total: number; suma: number }>();
  for (const r of rows) {
    const key = r.colegio ?? SIN_COLEGIO;
    const actual = porColegio.get(key) ?? { total: 0, suma: 0 };
    actual.total += 1;
    actual.suma += r.puntajeGlobal;
    porColegio.set(key, actual);
  }
  return Array.from(porColegio.entries())
    .map(([colegio, { total, suma }]) => ({ label: colegio, value: Math.round(suma / total), total }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

function BarChart({ data, suffix = "" }: { data: { label: string; value: number }[]; suffix?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-32 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5" title={`${d.label}: ${d.value}${suffix}`}>
          <div
            className="w-full rounded-t bg-primary"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? "2px" : 0 }}
          />
          <div className="max-w-full truncate text-[10px] text-muted-foreground">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export function DiagnosticosDashboard({ diagnosticos }: { diagnosticos: DiagnosticoAdminRow[] }) {
  const [bancoFiltro, setBancoFiltro] = React.useState(TODOS);
  const [colegioFiltro, setColegioFiltro] = React.useState(TODOS);
  const [desde, setDesde] = React.useState("");
  const [hasta, setHasta] = React.useState("");
  const [puntajeMin, setPuntajeMin] = React.useState("");
  const [puntajeMax, setPuntajeMax] = React.useState("");

  const colegios = React.useMemo(
    () => Array.from(new Set(diagnosticos.map((d) => d.colegio ?? SIN_COLEGIO))).sort((a, b) => a.localeCompare(b)),
    [diagnosticos]
  );

  const filtrados = React.useMemo(() => {
    return diagnosticos.filter((d) => {
      if (bancoFiltro !== TODOS && d.bancoId !== bancoFiltro) return false;
      if (colegioFiltro !== TODOS && (d.colegio ?? SIN_COLEGIO) !== colegioFiltro) return false;
      if (desde && d.createdAt.slice(0, 10) < desde) return false;
      if (hasta && d.createdAt.slice(0, 10) > hasta) return false;
      if (puntajeMin && d.puntajeGlobal < Number(puntajeMin)) return false;
      if (puntajeMax && d.puntajeGlobal > Number(puntajeMax)) return false;
      return true;
    });
  }, [diagnosticos, bancoFiltro, colegioFiltro, desde, hasta, puntajeMin, puntajeMax]);

  const total = filtrados.length;
  const promedioPuntaje = total > 0 ? Math.round(filtrados.reduce((sum, d) => sum + d.puntajeGlobal, 0) / total) : null;
  const conContacto = filtrados.filter((d) => d.acudienteEmail || d.acudienteTelefono).length;

  const tendencia = calcularTendencia(filtrados);
  const distribucion = calcularDistribucionPuntaje(filtrados);
  const promedioPorColegio = calcularPromedioPorColegio(filtrados);

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-1.5">
            <Label>Batería</Label>
            <Select value={bancoFiltro} onValueChange={setBancoFiltro}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todas</SelectItem>
                {(Object.entries(BANCO_LABEL) as [BancoId, string][]).map(([id, label]) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Colegio</Label>
            <Select value={colegioFiltro} onValueChange={setColegioFiltro}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                {colegios.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dx-desde">Desde</Label>
            <Input id="dx-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dx-hasta">Hasta</Label>
            <Input id="dx-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Puntaje global</Label>
            <div className="flex items-center gap-1.5">
              <Input type="number" min={0} max={100} placeholder="Mín" value={puntajeMin} onChange={(e) => setPuntajeMin(e.target.value)} />
              <span className="text-muted-foreground">–</span>
              <Input type="number" min={0} max={100} placeholder="Máx" value={puntajeMax} onChange={(e) => setPuntajeMax(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Diagnósticos" value={String(total)} />
        <StatCard label="Puntaje global promedio" value={promedioPuntaje !== null ? `${promedioPuntaje}%` : "—"} />
        <StatCard label="Con contacto de acudiente" value={String(conContacto)} />
      </div>

      {total > 0 ? (
        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card>
            <CardContent>
              <h3 className="mb-4 text-sm font-bold text-primary">Distribución de puntaje</h3>
              <BarChart data={distribucion} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="mb-4 text-sm font-bold text-primary">Promedio por colegio</h3>
              {promedioPorColegio.length > 0 ? (
                <BarChart data={promedioPorColegio} suffix="%" />
              ) : (
                <p className="text-sm text-muted-foreground">Sin datos.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="mb-4 text-sm font-bold text-primary">Diagnósticos por día ({DAYS_IN_TREND} días)</h3>
              <BarChart data={tendencia} />
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {total === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No hay diagnósticos con estos filtros.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Colegio</TableHead>
                  <TableHead>Batería</TableHead>
                  <TableHead>Puntaje</TableHead>
                  <TableHead>Enfoque</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Contacto acudiente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-muted-foreground">{formatFecha(d.createdAt)}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{d.estudianteNombre}</div>
                      {d.estudianteEdad ? <div className="text-xs text-muted-foreground">{d.estudianteEdad} años</div> : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{d.colegio ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge tone="info">{bancoLabelCorto(d.bancoId)}</StatusBadge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {d.puntajeGlobal}% ({d.aciertos}/{d.totalPreguntas})
                    </TableCell>
                    <TableCell className="text-muted-foreground">{d.enfoqueScore}%</TableCell>
                    <TableCell className="text-muted-foreground">{d.perfilDominante ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{d.acudienteEmail ?? d.acudienteTelefono ?? "—"}</TableCell>
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
