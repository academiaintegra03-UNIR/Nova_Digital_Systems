import { Card, CardContent } from "@/components/ui/card";
import { ProgressRow } from "@/components/shared/progress-row";
import { areaPerformance, studyHours } from "@/lib/data/campus";

export default function ProgresoPage() {
  const max = Math.max(...studyHours.map((w) => w.value));

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card>
        <CardContent>
          <h3 className="mb-4 text-base font-bold text-heading">Rendimiento por área</h3>
          {areaPerformance.map((a) => (
            <ProgressRow key={a.name} label={a.name} pct={a.pct} />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h3 className="mb-4 text-base font-bold text-heading">Horas de estudio (últimas 6 semanas)</h3>
          <div className="flex h-36 items-end gap-2.5">
            {studyHours.map((w) => (
              <div key={w.label} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t bg-glacier"
                  style={{ height: `${(w.value / max) * 100}%` }}
                />
                <div className="text-xs text-muted-foreground">{w.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
