import Link from "next/link";
import { BarChart3, CreditCard, ExternalLink, FileText, Mail, Users } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import { getActiveSubscription } from "@/lib/queries/subscription";
import { getClasesParaGrupos } from "@/lib/queries/clases";
import type { ClaseRow } from "@/lib/types/panels";
import { CreateChildDialog } from "@/features/acudientes/create-child-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { QuickLinksRow } from "@/components/shared/quick-link-tile";

interface HijoResumen {
  id: string;
  nombre: string;
  grupoNombre: string | null;
  tutorNombre: string | null;
  proximaClase: ClaseRow | null;
}

interface AcudienteHomeData {
  planName: string | null;
  seatLimit: number | null;
  hijos: HijoResumen[];
}

function formatScheduled(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

async function getAcudienteHomeData(guardianId: string): Promise<AcudienteHomeData> {
  const admin = createAdminClient();

  const sub = await getActiveSubscription(guardianId, "grupal");
  const planName = sub?.planName ?? null;
  const seatLimit = sub?.effectiveSeatLimit ?? null;

  const { data: links, error: linksError } = await admin
    .from("guardian_students")
    .select("student_id")
    .eq("guardian_id", guardianId);
  if (linksError) console.error("Failed to load guardian_students for acudiente home:", linksError);

  const studentIds = (links ?? []).map((l) => l.student_id);
  if (studentIds.length === 0) return { planName, seatLimit, hijos: [] };

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, nombre")
    .in("id", studentIds);
  if (profilesError) console.error("Failed to load hijos profiles:", profilesError);

  const { data: memberships } = await admin
    .from("grupo_estudiantes")
    .select("grupo_id, student_id")
    .in("student_id", studentIds);
  const grupoIdByStudent = new Map((memberships ?? []).map((m) => [m.student_id, m.grupo_id]));
  const grupoIds = Array.from(new Set((memberships ?? []).map((m) => m.grupo_id)));

  const { data: grupos } =
    grupoIds.length > 0
      ? await admin.from("grupos").select("id, name, tutor_id").in("id", grupoIds)
      : { data: [] as { id: string; name: string; tutor_id: string | null }[] };
  const grupoById = new Map((grupos ?? []).map((g) => [g.id, g]));

  const tutorIds = Array.from(new Set((grupos ?? []).map((g) => g.tutor_id).filter((id): id is string => Boolean(id))));
  const { data: tutorProfiles } =
    tutorIds.length > 0
      ? await admin.from("profiles").select("id, nombre").in("id", tutorIds)
      : { data: [] as { id: string; nombre: string }[] };
  const tutorNombreById = new Map((tutorProfiles ?? []).map((t) => [t.id, t.nombre]));

  const proximasClases = await getClasesParaGrupos(admin, grupoIds, { soloProximas: true });
  const proximaByGrupo = new Map<string, ClaseRow>();
  for (const clase of proximasClases) {
    if (!proximaByGrupo.has(clase.grupoId)) proximaByGrupo.set(clase.grupoId, clase);
  }

  const hijos: HijoResumen[] = (profiles ?? []).map((p) => {
    const grupoId = grupoIdByStudent.get(p.id) ?? null;
    const grupo = grupoId ? (grupoById.get(grupoId) ?? null) : null;
    return {
      id: p.id,
      nombre: p.nombre,
      grupoNombre: grupo?.name ?? null,
      tutorNombre: grupo?.tutor_id ? (tutorNombreById.get(grupo.tutor_id) ?? null) : null,
      proximaClase: grupoId ? (proximaByGrupo.get(grupoId) ?? null) : null,
    };
  });

  return { planName, seatLimit, hijos };
}

export default async function AcudientesResumenPage() {
  const profile = await getAuthenticatedProfile();
  const { planName, seatLimit, hijos } = profile
    ? await getAcudienteHomeData(profile.id)
    : { planName: null, seatLimit: null, hijos: [] };

  const hasGrupalPlan = planName !== null;
  const atLimit = seatLimit !== null && hijos.length >= seatLimit;

  return (
    <div>
      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-primary">
              {hasGrupalPlan ? `Plan ${planName}` : "Sin plan grupal activo"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {hasGrupalPlan
                ? `${hijos.length}${seatLimit ? ` de ${seatLimit}` : ""} cupo${seatLimit === 1 ? "" : "s"} usado${hijos.length === 1 ? "" : "s"}.`
                : "Puedes ver a tus hijos ya vinculados, pero agregar nuevos requiere un plan grupal."}
            </p>
          </div>
          {hasGrupalPlan ? (
            <CreateChildDialog disabled={atLimit} />
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/planes-precios">Ver planes grupales</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {hijos.length === 0 ? (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
            <Users className="mb-2 size-6" aria-hidden="true" />
            Todavía no tienes hijos vinculados.
          </CardContent>
        </Card>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {hijos.map((hijo) => (
            <Card key={hijo.id}>
              <CardContent>
                <div className="mb-3 flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-[#2FA6A1] font-bold text-white">{initials(hijo.nombre)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-bold text-foreground">{hijo.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {hijo.grupoNombre ? `${hijo.grupoNombre} · Tutor: ${hijo.tutorNombre ?? "Sin asignar"}` : "Sin grupo asignado"}
                    </div>
                  </div>
                </div>
                {hijo.proximaClase ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{hijo.proximaClase.nombre}</span>
                        <StatusBadge tone="info">{hijo.proximaClase.materiaNombre}</StatusBadge>
                      </div>
                      <div className="text-xs text-muted-foreground">{formatScheduled(hijo.proximaClase.scheduledAt)}</div>
                    </div>
                    {hijo.proximaClase.meetingLink ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={hijo.proximaClase.meetingLink} target="_blank" rel="noreferrer" className="gap-1.5">
                          <ExternalLink className="size-3.5" /> Unirse
                        </a>
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Sin clases próximas programadas.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h3 className="mb-3 text-base font-bold text-primary">Accesos rápidos</h3>
      <QuickLinksRow
        links={[
          { href: "/acudientes/mi-grupo", label: "Mi grupo", icon: Users },
          { href: "/acudientes/progreso", label: "Progreso", icon: BarChart3 },
          { href: "/acudientes/reportes", label: "Reportes", icon: FileText },
          { href: "/acudientes/pagos", label: "Pagos", icon: CreditCard },
          { href: "/acudientes/mensajes", label: "Mensajes", icon: Mail },
        ]}
      />
    </div>
  );
}
