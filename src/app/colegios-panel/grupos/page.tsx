import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import { getColegioPlanInfo } from "@/lib/queries/colegio-plan";
import { addStudentToSubgrupoAction, removeStudentFromSubgrupoAction } from "@/app/colegios-panel/grupos/actions";
import type { AdminGrupoRow, GrupoEstudianteOption } from "@/lib/types/panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { CreateSubgrupoDialog } from "@/features/colegios/create-subgrupo-dialog";
import { DeleteSubgrupoDialog } from "@/features/colegios/delete-subgrupo-dialog";
import { ManageGrupoStudentsDialog } from "@/features/admin/manage-grupo-students-dialog";

async function getColegioGruposData(colegioId: string) {
  const admin = createAdminClient();

  const { data: grupoRows, error: gruposError } = await admin
    .from("grupos")
    .select("*")
    .eq("colegio_id", colegioId)
    .order("es_default_colegio", { ascending: false })
    .order("name");
  if (gruposError) console.error("Failed to load grupos for colegio:", gruposError);

  const { data: students, error: studentsError } = await admin
    .from("profiles")
    .select("id, nombre")
    .eq("role", "estudiante")
    .eq("colegio_id", colegioId)
    .order("nombre");
  if (studentsError) console.error("Failed to load students for colegio:", studentsError);

  const { data: contactos } = await admin
    .from("profile_contacto")
    .select("profile_id, numero_documento")
    .in("profile_id", (students ?? []).map((s) => s.id));
  const numeroDocumentoById = new Map((contactos ?? []).map((c) => [c.profile_id, c.numero_documento]));

  const grupoIds = (grupoRows ?? []).map((g) => g.id);
  const { data: memberships } = await admin
    .from("grupo_estudiantes")
    .select("grupo_id, student_id")
    .in("grupo_id", grupoIds.length > 0 ? grupoIds : [""]);

  const studentIdsByGrupo = new Map<string, string[]>();
  for (const m of memberships ?? []) {
    const existing = studentIdsByGrupo.get(m.grupo_id) ?? [];
    existing.push(m.student_id);
    studentIdsByGrupo.set(m.grupo_id, existing);
  }

  const grupos: AdminGrupoRow[] = (grupoRows ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    colegioId: g.colegio_id,
    colegioNombre: null,
    tutorId: g.tutor_id,
    tutorNombre: null,
    esDefaultColegio: g.es_default_colegio,
    studentIds: studentIdsByGrupo.get(g.id) ?? [],
  }));

  const estudiantes: GrupoEstudianteOption[] = (students ?? []).map((s) => ({
    id: s.id,
    nombre: s.nombre,
    colegioId,
    colegioNombre: null,
    numeroDocumento: numeroDocumentoById.get(s.id) ?? null,
  }));

  return { grupos, estudiantes };
}

export default async function ColegiosGruposPage() {
  const profile = await getAuthenticatedProfile();
  const [{ grupos, estudiantes }, planInfo] = profile
    ? await Promise.all([getColegioGruposData(profile.id), getColegioPlanInfo(profile.id)])
    : [
        { grupos: [], estudiantes: [] },
        { planName: null, seatLimit: null, allowSubgrupos: true, allowAcudientes: true, studentCount: 0 },
      ];

  const hasPlan = planInfo.planName !== null;

  return (
    <div>
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-extrabold text-heading">Cupo del colegio</h1>
            <p className="text-sm text-muted-foreground">
              {hasPlan
                ? `Plan ${planInfo.planName} — ${planInfo.studentCount}${planInfo.seatLimit ? ` de ${planInfo.seatLimit}` : ""} cupo${planInfo.seatLimit === 1 ? "" : "s"} usado${planInfo.studentCount === 1 ? "" : "s"}.`
                : `No tienes un plan institucional activo — tienes ${planInfo.studentCount} estudiante${planInfo.studentCount === 1 ? "" : "s"} vinculado${planInfo.studentCount === 1 ? "" : "s"} sin límite de cupo.`}
            </p>
          </div>
          {!hasPlan ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/planes-precios">Ver planes institucionales</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {planInfo.allowSubgrupos ? (
        <div className="mb-4 flex justify-end">
          <CreateSubgrupoDialog />
        </div>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">
          Tu plan actual no incluye la creación de subgrupos propios — puedes seguir usando el grupo
          automático.
        </p>
      )}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estudiantes</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                    Todavía no hay grupos. Se crean automáticamente al asignar estudiantes.
                  </TableCell>
                </TableRow>
              ) : (
                grupos.map((grupo) => (
                  <TableRow key={grupo.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{grupo.name}</span>
                        {grupo.esDefaultColegio ? <StatusBadge tone="info">Automático</StatusBadge> : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{grupo.studentIds.length}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <ManageGrupoStudentsDialog
                          grupo={grupo}
                          colegios={[]}
                          estudiantes={estudiantes}
                          addStudentAction={addStudentToSubgrupoAction}
                          removeStudentAction={removeStudentFromSubgrupoAction}
                        />
                        <DeleteSubgrupoDialog grupo={grupo} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
