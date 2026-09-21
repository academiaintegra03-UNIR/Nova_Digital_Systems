"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Lightbulb, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

const QUESTION = "Si 3x + 5 = 20, ¿cuánto vale x?";
const OPTIONS = [3, 5, 7, 15];
const ANSWER = 5;
const HINT = "Pista: resta 5 en ambos lados antes de dividir entre 3.";

/**
 * A real, answerable practice question instead of a static screenshot — the
 * closest thing to actually trying the product without an account. Wrong
 * answers get a hint, not the solution, matching how the AI tutor is meant
 * to behave elsewhere in the product.
 */
export function TryAQuestionCard({ className }: { className?: string }) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const [tries, setTries] = React.useState(0);
  const correct = selected === ANSWER;

  function handleSelect(opt: number) {
    setSelected(opt);
    setTries((t) => t + 1);
  }

  return (
    <div
      className={cn(
        "relative w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6",
        className
      )}
    >
      <span className="absolute -top-3 -right-3 rounded-lg bg-cta px-3 py-1.5 text-xs font-medium text-cta-foreground shadow-sm">
        Pruébalo tú mismo
      </span>

      <div className="mb-1 text-xs font-bold tracking-wide text-secondary-foreground uppercase">
        Banco de preguntas · Álgebra
      </div>
      <p className="mb-4 text-base font-bold text-heading">{QUESTION}</p>

      <div className="mb-3 grid grid-cols-4 gap-2">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt;
          const showCorrect = selected !== null && opt === ANSWER && correct;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              aria-pressed={isSelected}
              className={cn(
                "flex h-11 items-center justify-center rounded-lg border text-sm font-bold transition-colors",
                showCorrect
                  ? "border-success bg-success-foreground text-success"
                  : isSelected
                    ? "border-warning bg-warning-foreground text-warning"
                    : "border-border bg-background text-heading hover:border-secondary-foreground"
              )}
            >
              x = {opt}
            </button>
          );
        })}
      </div>

      {selected === null ? (
        <p className="text-xs text-muted-foreground">Elige una opción — no hay penalidad, es solo práctica.</p>
      ) : correct ? (
        <div className="flex items-start gap-2 rounded-lg bg-success-foreground px-3 py-2.5 text-xs font-semibold text-success">
          <PartyPopper className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>¡Correcto! Así se sienten los avances pequeños, uno tras otro.</span>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-lg bg-warning-foreground px-3 py-2.5 text-xs font-semibold text-warning">
          <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{HINT} Inténtalo de nuevo.</span>
        </div>
      )}

      <Link
        href="/diagnostico"
        className="mt-4 flex items-center gap-1.5 text-sm font-bold text-heading hover:text-secondary-foreground"
      >
        {correct ? (
          <>
            Quiero más preguntas como esta <ArrowRight className="size-4" aria-hidden="true" />
          </>
        ) : (
          <>
            Ver mi nivel real con el diagnóstico <ArrowRight className="size-4" aria-hidden="true" />
          </>
        )}
      </Link>
      {tries > 2 && !correct ? (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Check className="size-3" aria-hidden="true" /> En el Campus, el tutor con IA te acompaña paso a paso en
          preguntas como esta.
        </p>
      ) : null}
    </div>
  );
}
