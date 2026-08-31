import Link from "next/link";
import { BarChart3, Bot, BookOpen, ClipboardList, Compass, ExternalLink, HelpCircle, Layers, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import { getClasesParaGrupos } from "@/lib/queries/clases";
import { splitProximasPasadas } from "@/lib/clases";
import type { ClaseRow } from "@/lib/types/panels";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { QuickLinksRow } from "@/components/shared/quick-link-tile";

interface CampusHomeData {
  grupoNombre: string | null;
  tutorNombre: string | null;
  companerosCount: number;
  proximasClases: ClaseRow[];
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

async function getCampusHomeData(studentId: string): Promise<CampusHomeData> {
  const supabase = await createClient();

  // Sin filtro por estudiante a propósito — misma policy RLS que ya usa
  // /campus/mi-grupo.
  const { data: memberships, error: membershipsError } = await supabase
    .from("grupo_estudiantes")
    .select("grupo_id, student_id");
  if (membershipsError) console.error("Failed to load grupo_estudiantes for campus home:", membershipsError);

  if (!memberships || memberships.length === 0) {
    return { grupoNombre: null, tutorNombre: null, companerosCount: 0, proximasClases: [] };
  }

  const grupoIds = Array.from(new Set(memberships.map((m) => m.grupo_id)));
  const { data: grupos, error: gruposError } = await supabase
    .from("grupos")
    .select("id, name, tutor_id")
    .in("id", grupoIds);
  if (gruposError) console.error("Failed to load grupos for campus home:", gruposError);

  const grupo = grupos?.[0] ?? null;
  const tutorId = grupo?.tutor_id ?? null;

  const { data: tutorProfile } = tutorId
    ? await supabase.from("profiles").select("nombre").eq("id", tutorId).maybeSingle()
    : { data: null };

  const companerosCount = memberships.filter((m) => m.grupo_id === grupo?.id && m.student_id !== studentId).length;

  const proximasClases = await getClasesParaGrupos(supabase, [], { confiarEnRLS: true, soloProximas: true, limit: 3 });

  return {
    grupoNombre: grupo?.name ?? null,
    tutorNombre: tutorProfile?.nombre ?? null,
    companerosCount,
    proximasClases,
  };
}

export default async function CampusHomePage() {
  const profile = await getAuthenticatedProfile();
  const firstName = profile?.nombre.split(" ")[0] ?? "";
  const { grupoNombre, tutorNombre, companerosCount, proximasClases } = profile
    ? await getCampusHomeData(profile.id)
    : { grupoNombre: null, tutorNombre: null, companerosCount: 0, proximasClases: [] };

  const { proximas } = splitProximasPasadas(proximasClases);
  const nextClass = proximas[0] ?? null;

  return (
    <div>
      <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl bg-primary px-7 py-6 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <div className="mb-1 text-xl font-bold">Hola, {firstName} 👋</div>
          <div className="text-sm text-[#EAF6F5]">
            {nextClass ? (
              <>
                Tu próxima clase es <strong>{formatScheduled(nextClass.scheduledAt)}</strong> —{" "}
                {nextClass.materiaNombre}: {nextClass.nombre}.
              </>
            ) : (
              "No tienes clases programadas por ahora."
            )}
          </div>
        </div>
        <Button className="relative shrink-0 bg-white text-primary hover:bg-white/90" asChild>
          <Link href="/campus/mis-clases">Ver mis clases</Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardContent>
            <h3 className="mb-3 text-base font-bold text-primary">Mi grupo</h3>
            {grupoNombre ? (
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Users className="size-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{grupoNombre}</div>
                  <div className="text-xs text-muted-foreground">
                    Tutor: {tutorNombre ?? "Sin asignar"} · {companerosCount} compañero
                    {companerosCount === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Todavía no estás en ningún grupo — cuando te asignen uno lo vas a ver aquí.
              </p>
            )}
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/campus/mi-grupo">Ver mi grupo</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="mb-3 text-base font-bold text-primary">Próximas clases</h3>
            {proximas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes clases próximas por ahora.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {proximas.map((clase) => (
                  <div
                    key={clase.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 last:border-none"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{clase.nombre}</span>
                        <StatusBadge tone="info">{clase.materiaNombre}</StatusBadge>
                      </div>
                      <div className="text-xs text-muted-foreground">{formatScheduled(clase.scheduledAt)}</div>
                    </div>
                    {clase.meetingLink ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={clase.meetingLink} target="_blank" rel="noreferrer" className="gap-1.5">
                          <ExternalLink className="size-3.5" /> Unirse
                        </a>
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" size="sm" className="mt-2" asChild>
              <Link href="/campus/mis-clases">Ver todas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <h3 className="mb-3 text-base font-bold text-primary">Accesos rápidos</h3>
      <QuickLinksRow
        links={[
          { href: "/campus/mis-materias", label: "Mis materias", icon: Layers },
          { href: "/campus/mi-ruta", label: "Mi ruta", icon: Compass },
          { href: "/campus/cursos", label: "Mis cursos", icon: BookOpen },
          { href: "/campus/banco-preguntas", label: "Banco de preguntas", icon: HelpCircle },
          { href: "/campus/simulacros", label: "Simulacros", icon: ClipboardList },
          { href: "/campus/progreso", label: "Progreso", icon: BarChart3 },
          { href: "/campus/tutor-ia", label: "Tutor con IA", icon: Bot },
        ]}
      />
    </div>
  );
}
