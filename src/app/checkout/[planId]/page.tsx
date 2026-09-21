import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { CheckoutForm } from "@/features/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

function formatCop(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(
    value
  );
}

export default async function CheckoutPage({ params }: PageProps<"/checkout/[planId]">) {
  const { planId } = await params;

  const supabase = await createClient();
  const { data: plan } = await supabase.from("plans").select("*").eq("id", planId).eq("active", true).single();
  if (!plan) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
      <Link
        href="/planes-precios"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Volver a planes
      </Link>

      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-foreground text-success">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-heading sm:text-2xl">Confirma tu inscripción</h1>
          <p className="text-xs text-muted-foreground">Pago procesado de forma segura por Wompi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <Card className="lg:sticky lg:top-6">
          <CardContent>
            <div className="mb-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Resumen de tu plan
            </div>
            <div className="mb-1 text-lg font-extrabold text-heading">{plan.name}</div>
            <p className="mb-3 text-sm text-muted-foreground">{plan.description}</p>

            {plan.seat_limit ? (
              <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                <Users className="size-3.5" aria-hidden="true" /> Hasta {plan.seat_limit} estudiantes
              </div>
            ) : null}

            <div className="space-y-2 border-t border-border pt-3">
              {plan.features.map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                  <span className="text-xs text-foreground/80">{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
              <span className="text-xs font-semibold text-muted-foreground">Total a pagar</span>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-heading">{formatCop(plan.price_cop)}</div>
                <div className="text-xs text-muted-foreground">{plan.period}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <CheckoutForm planId={plan.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
