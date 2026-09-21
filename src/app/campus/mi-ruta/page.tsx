import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { routeDetail } from "@/lib/data/campus";
import type { StatusTone } from "@/components/shared/status-badge";

const statusTone: Record<string, StatusTone> = {
  Completado: "success",
  "En curso": "info",
  Pendiente: "neutral",
};

export default function MiRutaPage() {
  return (
    <Card>
      <CardContent className="p-0">
        {routeDetail.map((m, i) => (
          <div key={m.name} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-none">
            <div
              className={
                m.status === "Completado"
                  ? "flex size-9 shrink-0 items-center justify-center rounded-lg bg-success-foreground font-extrabold text-success"
                  : m.status === "En curso"
                    ? "flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary font-extrabold text-secondary-foreground"
                    : "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted font-extrabold text-muted-foreground"
              }
            >
              {m.status === "Completado" ? <Check className="size-4" /> : i + 1}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-heading">{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.lessons} lecciones</div>
            </div>
            <StatusBadge tone={statusTone[m.status]}>{m.status}</StatusBadge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
