import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const description =
  "Clases de matemáticas, diagnóstico académico y preparación personalizada para Saber 11, admisiones universitarias y pruebas internacionales.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nova Digital Studio Systems | Matemáticas y preparación para exámenes",
    template: "%s · Nova Digital Studio Systems",
  },
  description,
  keywords: [
    "clases de matemáticas",
    "tutor de matemáticas",
    "preparación Saber 11",
    "curso preICFES",
    "preparación Universidad Nacional",
    "simulacros Saber 11",
    "refuerzo escolar",
    "clases virtuales de matemáticas",
    "preparación PAES",
    "preparación EXANI-II",
    "preparación PAA Costa Rica",
    "diagnóstico académico",
    "preparación admisión universitaria",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Nova Digital Studio Systems",
    title: "Nova Digital Studio Systems | Matemáticas y preparación para exámenes",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova Digital Studio Systems | Matemáticas y preparación para exámenes",
    description,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Nova Digital Studio Systems",
  description,
  url: siteUrl,
  logo: `${siteUrl}/Nova-PNG.png`,
  sameAs: [],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} dark antialiased`}>
      <body
        className="min-h-screen flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <Toaster position="top-center" theme="dark" richColors />
      </body>
    </html>
  );
}
