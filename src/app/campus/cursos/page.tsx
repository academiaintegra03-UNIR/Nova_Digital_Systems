import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { courses } from "@/lib/data/campus";

export default function CursosPage() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <Card key={c.name}>
          <CardContent>
            <div className="mb-1.5 text-xs font-bold tracking-wide text-glacier-strong uppercase">{c.level}</div>
            <div className="mb-2.5 text-base font-bold text-heading">{c.name}</div>
            <Progress value={c.pct} className="mb-2 h-1.5" />
            <div className="text-xs text-muted-foreground">{c.pct}% completado</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
