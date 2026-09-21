import { Card, CardContent } from "@/components/ui/card";
import { ProgressRow } from "@/components/shared/progress-row";
import { areaPerformance, masteredTopics, weakTopics } from "@/lib/data/acudientes";

export default function AcudientesProgresoPage() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card>
        <CardContent>
          <h3 className="mb-4 text-base font-bold text-heading">Avance por área</h3>
          {areaPerformance.map((a) => (
            <ProgressRow key={a.name} label={a.name} pct={a.pct} />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h3 className="mb-3 text-base font-bold text-heading">Temas</h3>
          <div className="mb-1.5 text-xs font-bold text-success">Dominados</div>
          <div className="mb-3.5 flex flex-wrap gap-1.5">
            {masteredTopics.map((t) => (
              <span key={t} className="rounded-full bg-success-foreground px-2.5 py-1 text-xs font-semibold text-success">
                {t}
              </span>
            ))}
          </div>
          <div className="mb-1.5 text-xs font-bold text-warning">Por reforzar</div>
          <div className="flex flex-wrap gap-1.5">
            {weakTopics.map((t) => (
              <span key={t} className="rounded-full bg-warning-foreground px-2.5 py-1 text-xs font-semibold text-warning">
                {t}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
