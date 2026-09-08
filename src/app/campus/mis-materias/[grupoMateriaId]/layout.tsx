import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getGrupoMateriaContextForStudent } from "@/lib/queries/grupo-materias";
import { CourseTabs } from "@/components/shared/course-tabs";
import { CourseSidebar } from "@/components/shared/course-sidebar";

export default async function CampusMiMateriaCursoLayout({
  children,
  params,
}: LayoutProps<"/campus/mis-materias/[grupoMateriaId]">) {
  const { grupoMateriaId } = await params;
  const supabase = await createClient();
  const curso = await getGrupoMateriaContextForStudent(supabase, grupoMateriaId);
  if (!curso) notFound();

  const { data: grupo } = await supabase.from("grupos").select("tutor_id").eq("id", curso.grupoId).maybeSingle();
  const { data: tutor } = grupo?.tutor_id
    ? await supabase.from("profiles").select("nombre").eq("id", grupo.tutor_id).maybeSingle()
    : { data: null };

  const base = `/campus/mis-materias/${grupoMateriaId}`;

  return (
    <div>
      <Link
        href="/campus/mis-materias"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Mis materias
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
          infoTitle="Tu tutor"
          infoRows={[
            { label: "Tutor", value: tutor?.nombre ?? "Sin asignar" },
            { label: "Grupo", value: curso.grupoNombre },
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
