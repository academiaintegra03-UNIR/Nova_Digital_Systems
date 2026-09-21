import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Program } from "@/lib/types/content";
import { Card, CardContent } from "@/components/ui/card";

export function ProgramCard({ program }: { program: Program }) {
  return (
    <Link href={`/programas/${program.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-2">
          <div className="text-xs font-bold tracking-wide text-glacier-strong uppercase">{program.level}</div>
          <div className="text-base font-bold text-heading">{program.name}</div>
          <p className="text-sm leading-relaxed text-muted-foreground">{program.blurb}</p>
          <div className="mt-auto flex items-center gap-1 pt-2 text-sm font-bold text-secondary-foreground">
            Ver programa <ArrowRight className="size-3.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
