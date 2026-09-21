import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "error" | "info" | "neutral";

const toneClasses: Record<StatusTone, string> = {
  success: "bg-success-foreground text-success",
  warning: "bg-warning-foreground text-warning",
  error: "bg-destructive/10 text-destructive",
  info: "bg-secondary text-heading",
  neutral: "bg-muted text-muted-foreground",
};

export function StatusBadge({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}
