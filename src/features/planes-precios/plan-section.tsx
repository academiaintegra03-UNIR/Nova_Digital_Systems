"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, GraduationCap, School, Users } from "lucide-react";
import type { Plan, PlanType } from "@/lib/types/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconTile } from "@/components/shared/icon-tile";
import { cn } from "@/lib/utils";

const ALL = "todos";

const TYPE_ICON: Record<PlanType, typeof GraduationCap> = {
  individual: GraduationCap,
  grupal: Users,
  institucional: School,
};

function formatCop(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(
    value
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden",
        plan.badge ? "ring-2 ring-primary" : "ring-1 ring-border"
      )}
    >
      {plan.badge ? (
        <div className="bg-primary px-4 py-1.5 text-center text-xs font-bold tracking-wide text-white uppercase">
          {plan.badge}
        </div>
      ) : null}
      <CardContent className="flex flex-1 flex-col">
        <IconTile icon={TYPE_ICON[plan.type]} tone={plan.badge ? "primary" : "secondary"} className="mb-3" />

        <div className="mb-1 text-lg font-extrabold text-heading">{plan.name}</div>
        <p className="mb-3.5 min-h-9 text-sm text-muted-foreground">{plan.description}</p>

        {plan.seatLimit ? (
          <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
            <Users className="size-3.5" aria-hidden="true" /> Hasta {plan.seatLimit} estudiantes
          </div>
        ) : null}

        <div className="font-data mb-0.5 text-2xl font-extrabold text-heading">{formatCop(plan.priceCop)}</div>
        <div className="mb-4 text-xs text-muted-foreground">{plan.period}</div>

        <div className="flex-1 space-y-2">
          {plan.features.map((f) => (
            <div key={f} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
              <span className="text-xs text-foreground/80">{f}</span>
            </div>
          ))}
        </div>

        <Button className="mt-5 w-full" size="lg" asChild>
          <Link href={`/checkout/${plan.id}`}>Inscribirme ahora</Link>
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">Pago seguro procesado por Wompi</p>
      </CardContent>
    </Card>
  );
}

/** Groups plans by `groupLabel` and shows a tab row when there's more than one group. */
export function PlanSection({ plans }: { plans: Plan[] }) {
  const groups = React.useMemo(() => {
    const labels = Array.from(new Set(plans.map((p) => p.groupLabel).filter((l): l is string => Boolean(l))));
    return labels;
  }, [plans]);

  const [activeGroup, setActiveGroup] = React.useState<string>(ALL);

  if (groups.length < 2) {
    return (
      <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    );
  }

  const ungrouped = plans.filter((p) => !p.groupLabel);
  const visible = activeGroup === ALL ? plans : [...ungrouped, ...plans.filter((p) => p.groupLabel === activeGroup)];

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <Button
          variant={activeGroup === ALL ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setActiveGroup(ALL)}
        >
          Todos
        </Button>
        {groups.map((label) => (
          <Button
            key={label}
            variant={activeGroup === label ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setActiveGroup(label)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
