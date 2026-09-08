import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/require-role";
import { getGrupoMateriaContextForTutor } from "@/lib/queries/grupo-materias";
import { CourseTabs } from "@/components/shared/course-tabs";
import { CourseSidebar } from "@/components/shared/course-sidebar";

export default async function TutorMateriaCursoLayout({
  children,
  params,
}: LayoutProps<"/tutores/materias/[grupoMateriaId]">) {
  const { grupoMateriaId } = await params;
  const profile = await requireRole("tutor");
  const admin = createAdminClient();
  const curso = await getGrupoMateriaContextForTutor(admin, grupoMateriaId, profile.id);
  if (!curso) notFound();

  const { count: estudiantesCount } = await admin
    .from("grupo_estudiantes")
    .select("student_id", { count: "exact", head: true })
    .eq("grupo_id", curso.grupoId);

  const base = `/tutores/materias/${grupoMateriaId}`;

  return (
    <div>
      <Link
        href="/tutores/materias"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Materias
      </Link>

      <div className="mb-4">
        <div className="text-xs text-muted-foreground">{curso.grupoNombre}</div>
        <h1 className="text-xl font-extrabold text-primary">{curso.materiaNombre}</h1>
      </div>

      <CourseTabs
        tabs={[
          { href: base, label: "Inicio" },
          { href: `${base}/clases`, label: "Clases" },
          { href: `${base}/actividades`, label: "Actividades" },
          { href: `${base}/recursos`, label: "Recursos" },
          { href: `${base}/foro`, label: "Foro" },
          { href: `${base}/asistente`, label: "Asistente" },
        ]}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">{children}</div>
        <CourseSidebar
          infoTitle="Tu grupo"
          infoRows={[
            { label: "Grupo", value: curso.grupoNombre },
            { label: "Estudiantes", value: String(estudiantesCount ?? 0) },
          ]}
          links={[
            { href: `${base}/clases`, label: "Clases" },
            { href: `${base}/actividades`, label: "Actividades" },
            { href: `${base}/recursos`, label: "Recursos" },
            { href: `${base}/foro`, label: "Foro" },
            { href: `${base}/asistente`, label: "Asistente" },
          ]}
        />
      </div>
    </div>
  );
}
