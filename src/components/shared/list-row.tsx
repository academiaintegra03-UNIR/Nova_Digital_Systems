import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/components/shared/status-badge";

const iconToneClasses = {
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-heading",
  success: "bg-success-foreground text-success",
  warning: "bg-warning-foreground text-warning",
  error: "bg-destructive/10 text-destructive",
} as const;

export type ListRowTone = keyof typeof iconToneClasses;

// Reuses a StatusBadge's tone for the matching row icon so the two visually agree.
export function listRowToneFromStatus(tone: StatusTone): ListRowTone {
  if (tone === "info" || tone === "neutral") return "secondary";
  return tone;
}

export function ListRow({
  icon: Icon,
  tone = "secondary",
  title,
  subtitle,
  trailing,
  className,
}: {
  icon: LucideIcon;
  tone?: ListRowTone;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5 last:border-none",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", iconToneClasses[tone])}>
          <Icon className="size-4.5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-heading">{title}</div>
          {subtitle ? <div className="truncate text-xs text-muted-foreground">{subtitle}</div> : null}
        </div>
      </div>
      {trailing ? <div className="flex shrink-0 items-center gap-3">{trailing}</div> : null}
    </div>
  );
}
