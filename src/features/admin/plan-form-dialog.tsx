"use client";

import * as React from "react";
import { toast } from "sonner";
import { createPlanAction, updatePlanAction } from "@/app/admin/planes/actions";
import type { Plan, PlanType, PlanBillingType } from "@/lib/types/billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NO_GROUP = "__none__";
const NEW_GROUP = "__new__";

export function PlanFormDialog({
  plan,
  trigger,
  existingGroupLabels,
}: {
  plan?: Plan;
  trigger: React.ReactNode;
  existingGroupLabels: string[];
}) {
  const isEdit = Boolean(plan);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<PlanType | "">(plan?.type ?? "");
  const [groupMode, setGroupMode] = React.useState(plan?.groupLabel || NO_GROUP);
  const [newGroupLabel, setNewGroupLabel] = React.useState("");
  const [allowSubgrupos, setAllowSubgrupos] = React.useState(plan?.allowSubgrupos ?? true);
  const [allowAcudientes, setAllowAcudientes] = React.useState(plan?.allowAcudientes ?? true);
  const [billingType, setBillingType] = React.useState<PlanBillingType>(plan?.billingType ?? "pago_unico");
  const [error, setError] = React.useState<string>();
  const [isPending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  const effectiveGroupLabel =
    groupMode === NO_GROUP ? "" : groupMode === NEW_GROUP ? newGroupLabel.trim() : groupMode;

  function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await (isEdit ? updatePlanAction : createPlanAction)(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(isEdit ? "Plan actualizado." : "Plan creado.");
      setOpen(false);
      if (!isEdit) formRef.current?.reset();
    });
  }

  // Sin esto, React resetea los campos no controlados apenas la función
  // termina (aunque devolvamos { error }), y el usuario pierde lo que
  // escribió cada vez que falla una validación.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSubmit(new FormData(e.currentTarget));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setError(undefined);
        if (next) {
          setType(plan?.type ?? "");
          setGroupMode(plan?.groupLabel || NO_GROUP);
          setNewGroupLabel("");
          setAllowSubgrupos(plan?.allowSubgrupos ?? true);
          setAllowAcudientes(plan?.allowAcudientes ?? true);
          setBillingType(plan?.billingType ?? "pago_unico");
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="grid-rows-[minmax(0,1fr)] overflow-hidden">
        <form ref={formRef} onSubmit={onSubmit} className="flex min-h-0 flex-col">
          {isEdit ? <input type="hidden" name="id" value={plan!.id} /> : null}
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar plan" : "Crear plan"}</DialogTitle>
            <DialogDescription>
              Este plan aparece en /planes-precios en cuanto quede activo.
            </DialogDescription>
          </DialogHeader>
          <div className="-mx-4 grid min-h-0 gap-4 overflow-y-auto overscroll-contain px-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-name">Nombre</Label>
              <Input id="plan-name" name="name" defaultValue={plan?.name} required disabled={isPending} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-description">Descripción corta</Label>
              <Input
                id="plan-description"
                name="description"
                placeholder="Clases en vivo grupales de alto rendimiento."
                defaultValue={plan?.description}
                required
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-type">Tipo</Label>
              <input type="hidden" name="type" value={type} />
              <Select value={type} onValueChange={(next) => setType(next as PlanType)} disabled={isPending}>
                <SelectTrigger id="plan-type" className="w-full">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual (1 estudiante, el comprador)</SelectItem>
                  <SelectItem value="grupal">Grupal / familiar (acudiente, varios hijos)</SelectItem>
                  <SelectItem value="institucional">Institucional (colegio)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-price">Precio (COP)</Label>
              <Input
                id="plan-price"
                name="price_cop"
                type="number"
                min={0}
                step={1000}
                defaultValue={plan?.priceCop}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-[1.2fr_1fr] gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan-billing-type">Tipo de cobro</Label>
                <input type="hidden" name="billing_type" value={billingType} />
                <Select
                  value={billingType}
                  onValueChange={(next) => setBillingType(next as PlanBillingType)}
                  disabled={isPending}
                >
                  <SelectTrigger id="plan-billing-type" className="w-full">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago_unico">Pago único</SelectItem>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="prueba_gratis">Prueba gratis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan-duration">Duración (días)</Label>
                <Input
                  id="plan-duration"
                  name="duration_days"
                  type="number"
                  min={1}
                  defaultValue={plan?.durationDays ?? undefined}
                  placeholder={billingType === "pago_unico" ? "Sin vencimiento" : "Ej. 30"}
                  required={billingType !== "pago_unico"}
                  disabled={isPending}
                />
              </div>
            </div>
            <p className="-mt-2.5 text-xs text-muted-foreground">
              Cuántos días dura la suscripción desde que se activa. En pago único, vacío = no vence.
            </p>

            {type === "grupal" || type === "institucional" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan-seats">Cupo de estudiantes</Label>
                <Input
                  id="plan-seats"
                  name="seat_limit"
                  type="number"
                  min={1}
                  defaultValue={plan?.seatLimit ?? undefined}
                  required
                  disabled={isPending}
                />
              </div>
            ) : null}

            {type === "institucional" ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input type="hidden" name="allow_subgrupos" value={String(allowSubgrupos)} />
                  <Checkbox
                    id="plan-allow-subgrupos"
                    checked={allowSubgrupos}
                    onCheckedChange={(checked) => setAllowSubgrupos(checked === true)}
                    disabled={isPending}
                  />
                  <Label htmlFor="plan-allow-subgrupos" className="font-normal">
                    El colegio puede crear sus propios subgrupos (8A, 8B...)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="hidden" name="allow_acudientes" value={String(allowAcudientes)} />
                  <Checkbox
                    id="plan-allow-acudientes"
                    checked={allowAcudientes}
                    onCheckedChange={(checked) => setAllowAcudientes(checked === true)}
                    disabled={isPending}
                  />
                  <Label htmlFor="plan-allow-acudientes" className="font-normal">
                    El colegio puede invitar acudientes para sus estudiantes
                  </Label>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-period">Período</Label>
              <Input
                id="plan-period"
                name="period"
                placeholder="Pago único · semestre"
                defaultValue={plan?.period}
                required
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-badge">Insignia (opcional)</Label>
              <Input
                id="plan-badge"
                name="badge"
                placeholder="Más popular"
                defaultValue={plan?.badge ?? ""}
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-group">Grupo / pestaña (opcional)</Label>
              <input type="hidden" name="group_label" value={effectiveGroupLabel} />
              <Select value={groupMode} onValueChange={setGroupMode} disabled={isPending}>
                <SelectTrigger id="plan-group" className="w-full">
                  <SelectValue placeholder="Sin grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GROUP}>Sin grupo</SelectItem>
                  {existingGroupLabels.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                  <SelectItem value={NEW_GROUP}>+ Crear nuevo grupo…</SelectItem>
                </SelectContent>
              </Select>
              {groupMode === NEW_GROUP ? (
                <Input
                  placeholder="Ej. Grado 10°"
                  value={newGroupLabel}
                  onChange={(e) => setNewGroupLabel(e.target.value)}
                  disabled={isPending}
                  autoFocus
                />
              ) : null}
              <p className="text-xs text-muted-foreground">
                Los planes con el mismo grupo se muestran juntos, con pestañas, en /planes-precios.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-features">Características (una por línea)</Label>
              <Textarea
                id="plan-features"
                name="features"
                rows={4}
                defaultValue={plan?.features.join("\n")}
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
