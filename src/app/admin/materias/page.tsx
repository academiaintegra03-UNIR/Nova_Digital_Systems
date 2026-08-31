import { createAdminClient } from "@/lib/supabase/admin";
import type { Materia } from "@/lib/types/panels";
import { Button } from "@/components/ui/button";
import { MateriaFormDialog } from "@/features/admin/materia-form-dialog";
import { MateriasTable } from "@/features/admin/materias-table";

async function getMaterias(): Promise<Materia[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("materias").select("id, name").order("name");
  if (error) {
    console.error("Failed to load materias:", error);
    return [];
  }
  return data;
}

export default async function AdminMateriasPage() {
  const materias = await getMaterias();

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <MateriaFormDialog trigger={<Button size="sm">+ Crear materia</Button>} />
      </div>
      <MateriasTable materias={materias} />
    </div>
  );
}
