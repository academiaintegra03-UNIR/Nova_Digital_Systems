import { cn } from "@/lib/utils";

/** Línea de acento bajo los títulos de sección (Oxford → Glacier). */
export function AccentBar({ className }: { className?: string }) {
  return <div className={cn("h-1 w-14 rounded-full bg-linear-to-r from-primary to-glacier", className)} aria-hidden="true" />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("mb-6 max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <div className="mb-2 text-xs font-bold tracking-wide text-secondary-foreground/70 uppercase">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-2xl font-extrabold text-heading sm:text-3xl">{title}</h2>
      <AccentBar className={cn("mt-3", align === "center" && "mx-auto")} />
      {description ? (
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
