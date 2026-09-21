import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { createAdminClient } from "@/lib/supabase/admin";

const DAYS_OF_HISTORY = 30;
const DAYS_IN_TREND = 14;

async function getChatLogs() {
  const admin = createAdminClient();
  const since = new Date(Date.now() - DAYS_OF_HISTORY * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("chat_logs")
    .select("created_at, success, error_reason, latency_ms")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    console.error("Failed to load chat_logs:", error);
    return [];
  }
  return data;
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

type ChatLogRow = Awaited<ReturnType<typeof getChatLogs>>[number];

// Kept outside the component: it calls Date.now(), which the React Compiler's
// purity rules forbid directly inside a component/hook body.
function summarizeChatLogs(logs: ChatLogRow[]) {
  const total = logs.length;
  const successCount = logs.filter((l) => l.success).length;
  const errorCount = total - successCount;
  const rateLimitedCount = logs.filter((l) => l.error_reason === "rate_limited").length;
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : null;

  const latencies = logs.filter((l) => l.success && l.latency_ms != null).map((l) => l.latency_ms as number);
  const avgLatencyMs =
    latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;

  const trend: { label: string; value: number }[] = [];
  for (let i = DAYS_IN_TREND - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    const count = logs.filter((l) => dayKey(l.created_at) === key).length;
    trend.push({ label: date.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" }), value: count });
  }
  const maxTrend = Math.max(1, ...trend.map((t) => t.value));

  const errorReasons = logs
    .filter((l) => !l.success)
    .reduce<Record<string, number>>((acc, l) => {
      const reason = l.error_reason ?? "desconocido";
      acc[reason] = (acc[reason] ?? 0) + 1;
      return acc;
    }, {});
  const topErrors = Object.entries(errorReasons).sort((a, b) => b[1] - a[1]);

  return { total, successCount, errorCount, rateLimitedCount, successRate, avgLatencyMs, trend, maxTrend, topErrors };
}

export default async function AdminIaPage() {
  const logs = await getChatLogs();
  const { total, successCount, errorCount, rateLimitedCount, successRate, avgLatencyMs, trend, maxTrend, topErrors } =
    summarizeChatLogs(logs);

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Chat de orientación con IA (Álex) — últimos {DAYS_OF_HISTORY} días.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard label="Mensajes recibidos" value={String(total)} />
        <StatCard label="Tasa de éxito" value={successRate !== null ? `${successRate}%` : "—"} />
        <StatCard label="Latencia promedio" value={avgLatencyMs !== null ? `${(avgLatencyMs / 1000).toFixed(1)}s` : "—"} />
        <StatCard label="Bloqueados por límite de tasa" value={String(rateLimitedCount)} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent>
            <h3 className="mb-4 text-base font-bold text-heading">Mensajes por día (últimos {DAYS_IN_TREND} días)</h3>
            {total === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay peticiones registradas.</p>
            ) : (
              <div className="flex h-32 items-end gap-2">
                {trend.map((t) => (
                  <div key={t.label} className="flex flex-1 flex-col items-center gap-1.5" title={`${t.label}: ${t.value}`}>
                    <div
                      className="w-full rounded-t bg-primary"
                      style={{ height: `${(t.value / maxTrend) * 100}%`, minHeight: t.value > 0 ? "2px" : 0 }}
                    />
                    <div className="text-[10px] text-muted-foreground">{t.label}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="mb-3.5 text-base font-bold text-heading">Estado</h3>
            <div className="flex items-start gap-2.5 border-b border-border py-2 text-sm last:border-none">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              <span>{successCount} respuestas exitosas</span>
            </div>
            <div className="flex items-start gap-2.5 border-b border-border py-2 text-sm last:border-none">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <span>{errorCount} con error</span>
            </div>

            {topErrors.length > 0 ? (
              <div className="mt-3">
                <div className="mb-1.5 text-xs font-bold text-muted-foreground uppercase">Motivos de error</div>
                {topErrors.map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between py-1 text-xs text-foreground/80">
                    <span>{reason}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
