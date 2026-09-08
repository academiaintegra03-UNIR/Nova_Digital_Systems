import { ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BANCO_LABEL, type BancoId } from "@/lib/diagnostico/types";
import type { DiagnosticoReportData } from "@/lib/diagnostico/report-pdf";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DescargarDiagnosticoButton } from "@/features/campus/descargar-diagnostico-button";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

async function getMisResultados() {
  const supabase = await createClient();

  // Sin filtro por perfil a propósito — la policy "estudiantes ven sus
  // propios diagnosticos" (0019) ya limita esto a profile_id = auth.uid().
  const { data, error } = await supabase.from("diagnosticos").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load mis resultados:", error);
    return [];
  }
  return data;
}

export default async function CampusMisResultadosPage() {
  const resultados = await getMisResultados();

  if (resultados.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <ClipboardList className="mb-3 size-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="mb-1.5 text-lg font-extrabold text-primary">Todavía no tienes diagnósticos</h1>
          <p className="text-sm text-muted-foreground">
            Cuando presentes una batería diagnóstica, tus resultados van a aparecer aquí.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {resultados.map((r) => {
        const reportData: DiagnosticoReportData = {
          estudianteNombre: r.estudiante_nombre,
          estudianteEdad: r.estudiante_edad ? String(r.estudiante_edad) : undefined,
          colegio: r.colegio ?? undefined,
          grado: r.grado,
          bancoLabel: BANCO_LABEL[r.banco_id as BancoId] ?? r.banco_id,
          createdAt: r.created_at,
          puntajeGlobal: r.puntaje_global,
          aciertos: r.aciertos,
          totalPreguntas: r.total_preguntas,
          enfoqueScore: r.enfoque_score,
          perfilDominante: r.perfil_dominante,
          desgloseMaterias: Array.isArray(r.desglose_materias)
            ? (r.desglose_materias as unknown as DiagnosticoReportData["desgloseMaterias"])
            : [],
          analisisIA: r.analisis_ia,
        };

        return (
          <Card key={r.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{reportData.bancoLabel}</span>
                  {r.perfil_dominante ? <StatusBadge tone="info">{r.perfil_dominante}</StatusBadge> : null}
                </div>
                <div className="text-xs text-muted-foreground">{formatFecha(r.created_at)}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-extrabold text-primary">{r.puntaje_global}%</div>
                  <div className="text-xs text-muted-foreground">
                    {r.aciertos}/{r.total_preguntas}
                  </div>
                </div>
                <DescargarDiagnosticoButton data={reportData} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
