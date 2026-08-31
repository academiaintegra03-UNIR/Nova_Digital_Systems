import Link from "next/link";
import { BarChart3, ClipboardList, ExternalLink, FileText, GraduationCap, Layers } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import { getColegioPlanInfo } from "@/lib/queries/colegio-plan";
import { getClasesParaGrupos } from "@/lib/queries/clases";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { QuickLinksRow } from "@/components/shared/quick-link-tile";

function formatScheduled(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getGrupoCountAndProximasClases(colegioId: string) {
  const admin = createAdminClient();

  const { data: grupos, error } = await admin.from("grupos").select("id").eq("colegio_id", colegioId);
  if (error) console.error("Failed to load grupos for colegio home:", error);

  const grupoIds = (grupos ?? []).map((g) => g.id);
  const proximasClases = await getClasesParaGrupos(admin, grupoIds, { soloProximas: true, limit: 5 });

  return { grupoCount: grupoIds.length, proximasClases };
}

export default async function ColegiosResumenPage() {
  const profile = await getAuthenticatedProfile();
  const [planInfo, { grupoCount, proximasClases }] = profile
    ? await Promise.all([getColegioPlanInfo(profile.id), getGrupoCountAndProximasClases(profile.id)])
    : [
        { planName: null, seatLimit: null, allowSubgrupos: true, allowAcudientes: true, studentCount: 0 },
        { grupoCount: 0, proximasClases: [] },
      ];

  const hasPlan = planInfo.planName !== null;

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Estudiantes activos" value={String(planInfo.studentCount)} />
        <StatCard label="Grupos" value={String(grupoCount)} />
        <StatCard
          label="Cupo usado"
          value={planInfo.seatLimit ? `${planInfo.studentCount} / ${planInfo.seatLimit}` : "Sin límite"}
        />
        <StatCard label="Plan" value={hasPlan ? planInfo.planName! : "Sin plan activo"} />
      </div>

      {!hasPlan ? (
        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              No tienes un plan institucional activo — tienes {planInfo.studentCount} estudiante
              {planInfo.studentCount === 1 ? "" : "s"} vinculado{planInfo.studentCount === 1 ? "" : "s"} sin límite
              de cupo.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/planes-precios">Ver planes institucionales</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mb-6">
        <CardContent>
          <h3 className="mb-3.5 text-base font-bold text-primary">Próximas clases en tu colegio</h3>
          {proximasClases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay clases programadas por ahora.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {proximasClases.map((clase) => (
                <div
                  key={clase.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2.5 last:border-none"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{clase.nombre}</span>
                      <StatusBadge tone="info">{clase.materiaNombre}</StatusBadge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {clase.grupoNombre} · {formatScheduled(clase.scheduledAt)}
                      {clase.tutorNombre ? ` · ${clase.tutorNombre}` : ""}
                    </div>
                  </div>
                  {clase.meetingLink ? (
                    <Button size="sm" variant="outline" asChild>
                      <a href={clase.meetingLink} target="_blank" rel="noreferrer" className="gap-1.5">
                        <ExternalLink className="size-3.5" /> Abrir
                      </a>
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <h3 className="mb-3 text-base font-bold text-primary">Accesos rápidos</h3>
      <QuickLinksRow
        links={[
          { href: "/colegios-panel/estudiantes", label: "Estudiantes", icon: GraduationCap },
          { href: "/colegios-panel/grupos", label: "Grupos", icon: Layers },
          { href: "/colegios-panel/resultados", label: "Resultados", icon: BarChart3 },
          { href: "/colegios-panel/simulacros", label: "Simulacros", icon: ClipboardList },
          { href: "/colegios-panel/informes", label: "Informes", icon: FileText },
        ]}
      />
    </div>
  );
}
