"use client";

import { Pencil } from "lucide-react";
import type { Materia } from "@/lib/types/panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MateriaFormDialog } from "@/features/admin/materia-form-dialog";
import { DeleteMateriaDialog } from "@/features/admin/delete-materia-dialog";

export function MateriasTable({ materias }: { materias: Materia[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {materias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="py-8 text-center text-sm text-muted-foreground">
                  Todavía no hay materias creadas.
                </TableCell>
              </TableRow>
            ) : (
              materias.map((materia) => (
                <TableRow key={materia.id}>
                  <TableCell className="font-semibold">{materia.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <MateriaFormDialog
                        materia={materia}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label={`Editar ${materia.name}`}>
                            <Pencil />
                          </Button>
                        }
                      />
                      <DeleteMateriaDialog materia={materia} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
