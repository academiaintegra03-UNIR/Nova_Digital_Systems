import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";
import { generatePassword } from "@/lib/generate-password";
import type { PlanType, UserRole } from "@/lib/supabase/database.types";

// individual: el comprador es el propio estudiante.
// grupal: el comprador queda como acudiente; los cupos extra se vinculan
//   después como sus estudiantes (guardian_students).
// institucional: el comprador queda como colegio; los cupos extra se
//   vinculan como profiles.colegio_id.
const ROLE_BY_PLAN_TYPE: Record<PlanType, UserRole> = {
  individual: "estudiante",
  grupal: "acudiente",
  institucional: "colegio",
};

/** Contacto del comprador mientras el pago está pendiente (`payments.datos_cuenta`). */
export interface DatosCuentaPago {
  telefono: string | null;
  tipoDocumento: string | null;
  numeroDocumento: string | null;
}

interface PagoConCuenta {
  id: string;
  plan_id: string;
  email: string;
  nombre: string;
  profile_id: string | null;
  datos_cuenta: unknown;
}

export type CuentaDelPago =
  /** `password` solo existe si la cuenta se acaba de crear. */
  | { tipo: "lista"; profileId: string; password: string | null }
  /** El correo ya pertenece a una cuenta de otro rol: lo resuelve soporte. */
  | { tipo: "rol_incompatible" }
  /** Falla temporal: el webhook responde error para que Wompi reintente. */
  | { tipo: "error" };

/**
 * Cuenta a la que se le activa un pago aprobado. Solo se llama con la
 * confirmación firmada de Wompi: la crea con una contraseña generada, o
 * reutiliza la que ya tenga ese correo sin tocar su contraseña.
 */
export async function resolverCuentaDelPago(
  admin: ReturnType<typeof createAdminClient>,
  pago: PagoConCuenta
): Promise<CuentaDelPago> {
  if (pago.profile_id) return { tipo: "lista", profileId: pago.profile_id, password: null };

  const { data: plan } = await admin.from("plans").select("type").eq("id", pago.plan_id).single();
  if (!plan) return { tipo: "error" };
  const role = ROLE_BY_PLAN_TYPE[plan.type];

  const datos = (pago.datos_cuenta ?? {}) as Partial<DatosCuentaPago>;
  const password = generatePassword();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: pago.email,
    password,
    email_confirm: true,
    user_metadata: {
      role,
      nombre: pago.nombre,
      telefono: datos.telefono ?? "",
      tipo_documento: datos.tipoDocumento ?? "",
      numero_documento: datos.numeroDocumento ?? "",
    },
  });

  let profileId = created?.user?.id ?? null;
  const yaExistia = !profileId && createError?.message.toLowerCase().includes("already been registered");

  if (yaExistia) {
    const { data: existenteId } = await admin.rpc("perfil_id_por_correo", { p_email: pago.email });
    if (!existenteId) return { tipo: "error" };
    const { data: perfil } = await admin.from("profiles").select("role").eq("id", existenteId).single();
    if (perfil?.role !== role) return { tipo: "rol_incompatible" };
    profileId = existenteId;
  }
  if (!profileId) {
    console.error("Failed to create account for payment:", pago.id, createError?.message);
    return { tipo: "error" };
  }

  const { error: updateError } = await admin.from("payments").update({ profile_id: profileId }).eq("id", pago.id);
  if (updateError) console.error("Failed to link payment to profile:", pago.id, updateError.message);

  return { tipo: "lista", profileId, password: yaExistia ? null : password };
}
