import Link from "next/link";
import { ArrowRight, CreditCard, GraduationCap, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCop } from "@/lib/receipt-pdf";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function primerDiaDelMes() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

async function getAdminHomeData() {
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  const [
    { count: estudiantesCount },
    { count: colegiosCount },
    { count: acudientesCount },
    { count: tutoresCount },
    { count: gruposCount },
    { count: pagosPendientesCount },
    { data: pagosAprobadosMes },
    { count: suscripcionesActivasCount },
    { count: diagnosticosCount },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "estudiante"),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "colegio"),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "acudiente"),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "tutor"),
    admin.from("grupos").select("id", { count: "exact", head: true }),
    admin.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("payments").select("amount_cop").eq("status", "approved").gte("created_at", primerDiaDelMes()),
    admin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`),
    admin.from("diagnosticos").select("id", { count: "exact", head: true }),
  ]);

  const ingresosMes = (pagosAprobadosMes ?? []).reduce((sum, p) => sum + p.amount_cop, 0);

  return {
    estudiantesCount: estudiantesCount ?? 0,
    colegiosCount: colegiosCount ?? 0,
    acudientesCount: acudientesCount ?? 0,
    tutoresCount: tutoresCount ?? 0,
    gruposCount: gruposCount ?? 0,
    pagosPendientesCount: pagosPendientesCount ?? 0,
    ingresosMes,
    suscripcionesActivasCount: suscripcionesActivasCount ?? 0,
    diagnosticosCount: diagnosticosCount ?? 0,
  };
}

export default async function AdminResumenPage() {
  const data = await getAdminHomeData();
  const usuariosActivos = data.estudiantesCount + data.colegiosCount + data.acudientesCount + data.tutoresCount;

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-5">
          {data.pagosPendientesCount > 0 ? (
            <div className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl bg-primary px-7 py-6 text-white">
              <div>
                <div className="mb-1 text-lg font-bold">
                  Tienes {data.pagosPendientesCount} pago{data.pagosPendientesCount === 1 ? "" : "s"} pendiente
                  {data.pagosPendientesCount === 1 ? "" : "s"} de revisar
                </div>
                <div className="text-sm text-white/80">Confírmalos o márcalos para no dejar cuentas a medio activar.</div>
              </div>
              <Button className="shrink-0 bg-white text-primary hover:bg-white/90" asChild>
                <Link href="/admin/pagos">Ver pagos</Link>
              </Button>
            </div>
          ) : (
            <div className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl bg-primary px-7 py-6 text-white">
              <div>
                <div className="mb-1 text-lg font-bold">Todo al día 👍</div>
                <div className="text-sm text-white/80">No hay pagos pendientes de revisar por ahora.</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <StatCard label="Usuarios activos" value={String(usuariosActivos)} />
            <StatCard label="Colegios" value={String(data.colegiosCount)} />
            <StatCard label="Grupos" value={String(data.gruposCount)} />
            <StatCard label="Ingresos del mes" value={formatCop(data.ingresosMes)} />
          </div>

          <Card>
            <CardContent>
              <h3 className="mb-3.5 text-base font-bold text-primary">Usuarios por rol</h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between border-b border-border py-2 last:border-none">
                  <span className="text-muted-foreground">Estudiantes</span>
                  <span className="font-semibold text-foreground">{data.estudiantesCount}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border py-2 last:border-none">
                  <span className="text-muted-foreground">Acudientes</span>
                  <span className="font-semibold text-foreground">{data.acudientesCount}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border py-2 last:border-none">
                  <span className="text-muted-foreground">Colegios</span>
                  <span className="font-semibold text-foreground">{data.colegiosCount}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Tutores</span>
                  <span className="font-semibold text-foreground">{data.tutoresCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/admin/diagnosticos">
            <div className="flex items-center gap-3.5 rounded-2xl bg-teal px-5 py-5 text-white transition-opacity hover:opacity-90">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <GraduationCap className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold tracking-wide text-white/80 uppercase">Diagnósticos</div>
                <div className="text-lg font-extrabold">{data.diagnosticosCount} completados</div>
              </div>
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </div>
          </Link>

          <Link href="/admin/planes">
            <div className="flex items-center gap-3.5 rounded-2xl bg-[#1e3a5f] px-5 py-5 text-white transition-opacity hover:opacity-90">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <CreditCard className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold tracking-wide text-white/70 uppercase">Suscripciones</div>
                <div className="text-lg font-extrabold">{data.suscripcionesActivasCount} activas</div>
              </div>
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </div>
          </Link>

          <Card className="border-none bg-warning-foreground">
            <CardContent className="py-5">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="size-4 text-warning" aria-hidden="true" />
                <span className="text-xs font-bold tracking-wide text-warning uppercase">Novedad</span>
              </div>
              <h3 className="mb-1.5 text-sm font-bold text-foreground">Asistente de IA por materia</h3>
              <p className="mb-3 text-xs text-foreground/70">
                Cada materia ahora tiene su propio chat de IA y una pestaña de recursos — revisa cómo se ve desde
                un grupo real.
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/admin/grupos">Ver grupos</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="mb-1.5 flex items-center gap-2">
                <ShieldCheck className="size-4 text-teal" aria-hidden="true" />
                <span className="text-xs font-bold text-foreground">Acceso seguro</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Los permisos por rol y las políticas de base de datos ya están activos en toda la plataforma.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="mb-1.5 flex items-center gap-2">
                <Layers className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs font-bold text-foreground">Materias y clases</span>
              </div>
              <Button variant="ghost" size="sm" className="mt-1 w-full justify-start gap-1.5 px-0" asChild>
                <Link href="/admin/materias">
                  Ver catálogo de materias <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
