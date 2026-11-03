import type { LucideIcon } from "lucide-react";

export interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface TrustItem {
  icon: LucideIcon;
  label: string;
}

export interface NeedCard {
  icon: LucideIcon;
  title: string;
  desc: string;
  programId: string;
}

export interface DiagnosticStep {
  n: number;
  label: string;
}

export type ProgramLevel =
  | "Primaria"
  | "Bachillerato"
  | "Preparación de exámenes"
  | "Universidad";

export interface Program {
  id: string;
  level: ProgramLevel;
  name: string;
  blurb: string;
  description: string;
  topics: string[];
  methodology: string;
  includes: string[];
  modality: string;
  duration: string;
  tutor: string;
}

export interface MethodologyPoint {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface CountryFaq {
  q: string;
  a: string;
}

export type CountryId = "colombia" | "chile" | "mexico" | "costa_rica";

export interface Country {
  id: CountryId;
  name: string;
  flag: string;
  exam: string;
  description: string;
  audience: string;
  areas: string[];
  modality: string;
  duration: string;
  simulations: string;
  tracking: string;
  plans: string[];
  faqs: CountryFaq[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export type ResourceLevel =
  | "Primaria"
  | "Bachillerato"
  | "Preparación exámenes"
  | "Universidad"
  | "Todos";

export interface Resource {
  id: number;
  title: string;
  type: string;
  level: ResourceLevel;
  icon: LucideIcon;
  tag: "Gratis" | "Exclusivo";
  /** A dónde lleva la tarjeta. Las URLs absolutas (Drive, YouTube, Sites)
   * se abren en otra pestaña; las rutas internas, en la misma. Sin href la
   * tarjeta no es clicable. */
  href?: string;
}
