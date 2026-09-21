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
      {/* Branding panel — hidden on mobile, matches the sidebar's navy + the
          hero's graph-paper texture so /login reads as the same product. */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary px-10 py-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 20% 20%, black 30%, transparent 100%)",
            maskImage: "radial-gradient(ellipse 80% 60% at 20% 20%, black 30%, transparent 100%)",
          }}
        />

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
