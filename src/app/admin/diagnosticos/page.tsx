import { createAdminClient } from "@/lib/supabase/admin";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const BANCO_LABEL: Record<string, string> = {
  general: "General (14)",
  noveno: "Pre-ICFES 9° (60)",
  decimo: "Pre-ICFES 10° (108)",
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function getDiagnosticos() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("diagnosticos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("Failed to load diagnosticos:", error);
    return [];
  }
  return data;
}

export default async function AdminDiagnosticosPage() {
  const diagnosticos = await getDiagnosticos();

  const total = diagnosticos.length;
  const promedioPuntaje =
    total > 0 ? Math.round(diagnosticos.reduce((sum, d) => sum + d.puntaje_global, 0) / total) : null;
  const conContacto = diagnosticos.filter((d) => d.acudiente_email || d.acudiente_telefono).length;

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">Leads capturados por la batería diagnóstica pública (/diagnostico).</p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Diagnósticos completados" value={String(total)} />
        <StatCard label="Puntaje global promedio" value={promedioPuntaje !== null ? `${promedioPuntaje}%` : "—"} />
        <StatCard label="Con contacto de acudiente" value={String(conContacto)} />
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {total === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Todavía no hay diagnósticos registrados.</p>
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
                {diagnosticos.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-muted-foreground">{formatFecha(d.created_at)}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{d.estudiante_nombre}</div>
                      {d.estudiante_edad ? <div className="text-xs text-muted-foreground">{d.estudiante_edad} años</div> : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{d.colegio ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge tone="info">{BANCO_LABEL[d.banco_id] ?? d.banco_id}</StatusBadge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {d.puntaje_global}% ({d.aciertos}/{d.total_preguntas})
                    </TableCell>
                    <TableCell className="text-muted-foreground">{d.enfoque_score}%</TableCell>
                    <TableCell className="text-muted-foreground">{d.perfil_dominante ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {d.acudiente_email ?? d.acudiente_telefono ?? "—"}
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
