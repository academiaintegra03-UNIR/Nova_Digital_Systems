export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Direct top-level links — kept short on purpose so the header stays scannable.
export const marketingNavPrimary: NavItem[] = [
  { href: "/diagnostico", label: "Diagnóstico" },
  { href: "/alex", label: "Habla con Álex" },
  { href: "/planes-precios", label: "Planes y precios" },
  { href: "/recursos", label: "Recursos" },
];

// Related links grouped under a single dropdown trigger instead of ten flat
// items competing for space — see reference/prototipos for the original list.
export const marketingNavGroups: NavGroup[] = [
  {
    label: "Programas",
    items: [
      { href: "/programas", label: "Todos los programas", description: "Primaria, bachillerato y universidad" },
      { href: "/paises", label: "Preparación de exámenes", description: "Saber 11, PAES, EXANI-II, PAA y más" },
      { href: "/colegios", label: "Metodología y colegios", description: "Cómo enseñamos y servicios institucionales" },
    ],
  },
  {
    label: "Nosotros",
    items: [
      { href: "/nosotros", label: "Nuestro equipo" },
      { href: "/faq", label: "Preguntas frecuentes" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
];

// Flattened order, used for the mobile sheet and any place that just needs a plain list.
export const marketingNav: NavItem[] = [
  { href: "/programas", label: "Programas" },
  { href: "/paises", label: "Preparación de exámenes" },
  { href: "/diagnostico", label: "Diagnóstico" },
  { href: "/alex", label: "Habla con Álex" },
  { href: "/colegios", label: "Metodología" },
  { href: "/planes-precios", label: "Planes y precios" },
  { href: "/recursos", label: "Recursos" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/faq", label: "FAQ" },
  { href: "/contacto", label: "Contacto" },
];

export const footerPlatformLinks: NavItem[] = [
  { href: "/programas", label: "Programas" },
  { href: "/paises", label: "Preparación por país" },
  { href: "/planes-precios", label: "Planes y precios" },
  { href: "/recursos", label: "Recursos" },
];

export const footerCompanyLinks: NavItem[] = [
  { href: "/nosotros", label: "Nosotros" },
  { href: "/faq", label: "Preguntas frecuentes" },
  { href: "/contacto", label: "Contacto" },
];
