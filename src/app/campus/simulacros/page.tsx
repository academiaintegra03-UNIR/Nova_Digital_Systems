import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { availableSims, pastSims } from "@/lib/data/campus";

export default function SimulacrosPage() {
  return (
    <div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {availableSims.map((sm) => (
          <Card key={sm.name}>
            <CardContent>
              <div className="mb-1.5 text-base font-bold text-heading">{sm.name}</div>
              <div className="mb-3.5 text-xs text-muted-foreground">
                {sm.questions} preguntas · {sm.duration}
              </div>
              <Button variant="cta" className="w-full">Iniciar simulacro</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <h3 className="mb-3 text-lg font-bold text-heading">Intentos anteriores</h3>
      <Card>
        <CardContent className="p-0">
          {pastSims.map((ps) => (
            <div
              key={ps.name}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3.5 text-sm last:border-none"
            >
              <span className="font-semibold">{ps.name}</span>
              <span className="text-muted-foreground">{ps.date}</span>
              <StatusBadge tone={ps.tone}>{ps.score}</StatusBadge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
