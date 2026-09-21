"use client";

import * as React from "react";
import { resources } from "@/lib/data/resources";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ALL = "todos";

export function ResourceFilterList() {
  const levels = React.useMemo(() => [ALL, ...new Set(resources.map((r) => r.level))], []);
  const [level, setLevel] = React.useState<string>(ALL);
  const filtered = level === ALL ? resources : resources.filter((r) => r.level === level);

  return (
    <div>
      <div className="mb-7 flex flex-wrap gap-2.5">
        {levels.map((lv) => (
          <Button
            key={lv}
            size="sm"
            variant={level === lv ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setLevel(lv)}
          >
            {lv === ALL ? "Todos" : lv}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <Card key={r.id}>
            <CardContent>
              <div className="mb-2.5 flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-heading">
                  <r.icon className="size-4.5" aria-hidden="true" />
                </div>
                <span
                  className={cn(
                    "rounded-lg px-2 py-0.5 text-xs font-bold",
                    r.tag === "Gratis" ? "bg-success-foreground text-success" : "bg-warning-foreground text-warning"
                  )}
                >
                  {r.tag}
                </span>
              </div>
              <div className="mb-1 text-sm font-bold text-heading">{r.title}</div>
              <div className="text-xs text-muted-foreground">
                {r.type} · {r.level}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
