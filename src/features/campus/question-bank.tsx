"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bankStats, sampleQuestion } from "@/lib/data/campus";

export function QuestionBank() {
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardContent>
          <div className="mb-2.5 text-xs text-muted-foreground">{sampleQuestion.meta}</div>
          <div className="mb-4.5 text-base font-semibold">{sampleQuestion.prompt}</div>
          {sampleQuestion.options.map((op) => (
            <button
              key={op}
              onClick={() => setSelected(op)}
              className={cn(
                "mb-2.5 block w-full rounded-[10px] border-[1.5px] px-3.5 py-3 text-left text-sm transition-colors",
                selected === op ? "border-primary bg-secondary" : "border-input hover:border-primary hover:bg-muted"
              )}
            >
              {op}
            </button>
          ))}
          <Button
            disabled={!selected}
            onClick={() => toast.success("Respuesta enviada (simulada)")}
          >
            Confirmar respuesta
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="mb-1 text-sm text-muted-foreground">Intentos esta semana</div>
          <div className="mb-3.5 text-2xl font-extrabold text-heading">{bankStats.attempts}</div>
          <div className="mb-1 text-sm text-muted-foreground">Precisión</div>
          <div className="mb-3.5 text-2xl font-extrabold text-success">{bankStats.accuracy}</div>
          <div className="text-xs text-muted-foreground">
            Tema con más errores: <strong className="text-warning">{bankStats.weakestTopic}</strong>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
