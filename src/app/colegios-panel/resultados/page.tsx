import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { areaResults } from "@/lib/data/colegios-panel";

export default function ColegiosResultadosPage() {
  return (
    <Card>
      <CardContent>
        <h3 className="mb-4 text-base font-bold text-heading">
          Resultados agregados por área (último simulacro institucional)
        </h3>
        {areaResults.map((a) => (
          <div key={a.name} className="mb-3.5">
            <div className="mb-1 flex justify-between text-sm">
              <span>{a.name}</span>
              <span className="text-muted-foreground">{a.pct}% promedio</span>
            </div>
            <Progress value={a.pct} className="h-2.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
