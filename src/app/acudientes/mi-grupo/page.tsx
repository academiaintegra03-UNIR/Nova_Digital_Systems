import Link from "next/link";
import { Users } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import { getActiveSubscription } from "@/lib/queries/subscription";
import { CreateChildDialog } from "@/features/acudientes/create-child-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MiGrupoFamiliarData {
  planName: string | null;
  seatLimit: number | null;
  hijos: { id: string; nombre: string }[];
}

async function getMiGrupoFamiliar(guardianId: string): Promise<MiGrupoFamiliarData> {
  const admin = createAdminClient();

  const sub = await getActiveSubscription(guardianId, "grupal");
  const planName = sub?.planName ?? null;
  const seatLimit = sub?.effectiveSeatLimit ?? null;

  const { data: links, error: linksError } = await admin
    .from("guardian_students")
    .select("student_id")
    .eq("guardian_id", guardianId);
  if (linksError) console.error("Failed to load guardian_students for acudiente:", linksError);

  const studentIds = (links ?? []).map((l) => l.student_id);
  let hijos: { id: string; nombre: string }[] = [];
  if (studentIds.length > 0) {
    const { data: profiles } = await admin.from("profiles").select("id, nombre").in("id", studentIds);
    hijos = (profiles ?? []).map((p) => ({ id: p.id, nombre: p.nombre }));
  }

  return { planName, seatLimit, hijos };
}

export default async function AcudientesMiGrupoPage() {
  const profile = await getAuthenticatedProfile();
  const { planName, seatLimit, hijos } = profile
    ? await getMiGrupoFamiliar(profile.id)
    : { planName: null, seatLimit: null, hijos: [] };

  const hasGrupalPlan = planName !== null;
  const atLimit = seatLimit !== null && hijos.length >= seatLimit;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-extrabold text-heading">Mi grupo familiar</h1>
              <p className="text-sm text-muted-foreground">
                {hasGrupalPlan
                  ? `Plan ${planName} — ${hijos.length}${seatLimit ? ` de ${seatLimit}` : ""} cupo${seatLimit === 1 ? "" : "s"} usado${hijos.length === 1 ? "" : "s"}.`
                  : "No tienes un plan grupal activo — puedes ver a tus hijos ya vinculados, pero agregar nuevos requiere un plan grupal."}
              </p>
            </div>
            {hasGrupalPlan ? <CreateChildDialog disabled={atLimit} /> : null}
          </div>

          {hijos.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {hijos.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <Users className="size-4 text-muted-foreground" aria-hidden="true" />
                  {h.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Todavía no tienes hijos vinculados.</p>
          )}

          {!hasGrupalPlan ? (
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/planes-precios">Ver planes grupales</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
