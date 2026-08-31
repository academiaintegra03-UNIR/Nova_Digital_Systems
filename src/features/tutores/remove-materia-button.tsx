"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeMateriaFromGrupoAction } from "@/app/tutores/materias/actions";
import { Button } from "@/components/ui/button";

export function RemoveMateriaButton({ id, label }: { id: string; label: string }) {
  const [isPending, startTransition] = React.useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const result = await removeMateriaFromGrupoAction(fd);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Se quitó "${label}" del grupo.`);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      aria-label={`Quitar ${label}`}
      disabled={isPending}
      onClick={handleClick}
    >
      <Trash2 />
    </Button>
  );
}
