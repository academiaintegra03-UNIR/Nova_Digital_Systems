import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/features/contacto/contact-form";
import { PendingBadge } from "@/components/shared/pending-badge";
import { getWhatsAppDisplayNumber, getWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactPage() {
  const whatsappLink = getWhatsAppLink("Hola, quiero más información sobre Nova Digital Studio Systems.");
  const whatsappDisplay = getWhatsAppDisplayNumber();

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-9 px-4 py-12 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <h1 className="mb-2.5 text-3xl font-extrabold text-heading">Hablemos</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Cuéntanos qué necesitas y te contactamos en menos de 24 horas.
        </p>
        <ContactForm />
      </div>

      <div className="h-fit rounded-2xl bg-secondary p-6">
        <div className="mb-3.5 text-base font-extrabold text-heading">Otras formas de contacto</div>
        <div className="mb-2.5 flex items-start gap-2 text-sm text-foreground/80">
          <span>💬 WhatsApp directo —</span>
          {whatsappLink ? (
            <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-secondary-foreground hover:underline">
              {whatsappDisplay}
            </Link>
          ) : (
            <PendingBadge label="Número por confirmar" />
          )}
        </div>
        <div className="mb-2.5 flex items-start gap-2 text-sm text-foreground/80">
          <span>✉️ Correo de admisiones —</span>
          <PendingBadge label="Pendiente de validación" />
        </div>
        <div className="text-sm text-foreground/80">
          📍 Bogotá (presencial) y modalidad virtual para toda la región
        </div>
      </div>
    </div>
  );
}
