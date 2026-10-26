import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { esCuentaPruebaGratuita } from "@/lib/prueba-gratuita/estado";
import { Logo } from "@/components/layout/logo";
import { UserMenu } from "@/components/layout/user-menu";

/**
 * Espacio aparte del campus para las cuentas de prueba gratuita (creadas
 * desde /admin/postulantes): sin sidebar ni navegación — solo la prueba
 * y, al terminarla, el informe. El link del correo de acceso apunta aquí;
 * sin sesión, requireRole manda a /login y de ahí /campus redirige de
 * vuelta a esta página. Un estudiante que no es de prueba va al campus.
 */
export default async function PruebaGratuitaLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("estudiante");
  if (!(await esCuentaPruebaGratuita(profile))) redirect("/campus");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <Logo />
          <UserMenu profile={profile} />
        </div>
      </header>
      <main id="contenido-principal" className="flex-1">
        {children}
      </main>
    </div>
  );
}
