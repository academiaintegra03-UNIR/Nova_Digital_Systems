import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/types/billing";
import { PlanSection } from "@/features/planes-precios/plan-section";

export const metadata: Metadata = { title: "Planes y precios" };

async function getActivePlans(): Promise<Plan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("active", true)
    .order("price_cop");

  if (error) {
    console.error("Failed to load plans:", error);
    return [];
  }

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    type: p.type,
    priceCop: p.price_cop,
    seatLimit: p.seat_limit,
    period: p.period,
    badge: p.badge,
    features: p.features,
    groupLabel: p.group_label,
    active: p.active,
    allowSubgrupos: p.allow_subgrupos,
    allowAcudientes: p.allow_acudientes,
    billingType: p.billing_type,
    durationDays: p.duration_days,
  }));
}

export default async function PricingPage() {
  const plans = await getActivePlans();
  const individualPlans = plans.filter((p) => p.type === "individual");
  const grupalPlans = plans.filter((p) => p.type === "grupal");
  const institutionalPlans = plans.filter((p) => p.type === "institucional");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <h1 className="mb-2 text-center text-3xl font-extrabold text-heading">Planes y precios</h1>
      <p className="mb-10 text-center text-base text-muted-foreground">
        Elige la modalidad que se ajuste a tu ritmo de estudio.
      </p>

      {plans.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">Todavía no hay planes publicados.</p>
      ) : null}

      {individualPlans.length > 0 ? (
        <section className="mb-14">
          <PlanSection plans={individualPlans} />
        </section>
      ) : null}

      {grupalPlans.length > 0 ? (
        <section className="mb-14">
          <h2 className="mb-2 text-center text-2xl font-extrabold text-heading">Planes grupales y familiares</h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Un plan, varios estudiantes — ideal para hermanos o pequeños grupos.
          </p>
          <PlanSection plans={grupalPlans} />
        </section>
      ) : null}

      {institutionalPlans.length > 0 ? (
        <section>
          <h2 className="mb-2 text-center text-2xl font-extrabold text-heading">Planes para colegios</h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Convenios institucionales con cupo de estudiantes.
          </p>
          <PlanSection plans={institutionalPlans} />
        </section>
      ) : null}
    </div>
  );
}
