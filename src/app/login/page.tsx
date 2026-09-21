import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/features/auth/login-form";
import { siteName, siteTagline, trustItems } from "@/lib/data/home-content";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Branding panel — hidden on mobile, mismo fondo oscuro con resplandores Glacier
          que la portada y los paneles, para que /login se lea como el mismo producto. */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary px-10 py-10 text-white lg:flex">
        <div className="tech-glow pointer-events-none absolute -top-40 -left-32 size-[34rem] opacity-60" aria-hidden="true" />
        <div className="tech-glow pointer-events-none absolute -right-40 -bottom-48 size-[36rem] opacity-40" aria-hidden="true" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <Image src="/Nova-PNG.png" alt="" width={36} height={36} className="rounded-full" priority />
          <span>
            <span className="block text-lg leading-tight font-extrabold">{siteName}</span>
            <span className="block text-xs leading-tight text-on-primary-muted">{siteTagline}</span>
          </span>
        </Link>

        <div className="relative max-w-sm">
          <h2 className="mb-6 text-3xl leading-tight font-extrabold text-balance">
            Todo tu progreso académico, en un solo lugar.
          </h2>
          <ul className="space-y-4">
            {trustItems.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-on-primary/10">
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
                <span className="pt-1.5 text-sm leading-relaxed text-on-primary-muted">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-on-primary-subtle">© 2026 {siteName}</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
            <Image src="/Nova-PNG.png" alt="" width={32} height={32} className="rounded-full" priority />
            <span className="text-base font-extrabold text-heading">{siteName}</span>
          </Link>

          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-extrabold text-heading sm:text-3xl">Bienvenido de nuevo</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa con el correo y la contraseña de tu cuenta.
            </p>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>

          <Link
            href="/"
            className="mt-8 flex items-center justify-center gap-1.5 text-sm font-bold text-secondary-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" /> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
