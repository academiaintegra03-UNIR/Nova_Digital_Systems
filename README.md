# Nova Digital Studio Systems — web

Aplicación Next.js (App Router, TypeScript, Tailwind v4, shadcn/ui) para el
sitio público y los paneles de Nova Digital Studio Systems.

See the project root [`README.md`](../README.md) for full documentation:
structure, what's simulated, what's pending integration, and where the
original `.dc.html` prototypes live.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm lint
pnpm build
pnpm start
```

## Identidad de marca (Glacier & Oxford) — tema oscuro "glass"

El sitio es oscuro (`<html class="dark">`), inspirado en el ecosistema NDSS
(inteligencia-educativa-ndss.web.app) pero construido con los colores del manual.
Fuente única: las primitivas de [src/app/globals.css](src/app/globals.css)
(`--oxford`, `--glacier`, `--arctic`, `--paper`, `--alert`). Los componentes nunca
escriben hex; usan tokens semánticos.

| Rol | Token / clase | Uso |
|---|---|---|
| Fondo de página | `bg-background` (Oxford oscurecido + resplandores Glacier) | Página |
| Tarjeta de cristal | `bg-card` (Oxford + 12% Glacier, blur y borde translúcido) | Tarjetas, menús, sidebar |
| Bloque resaltado | `bg-secondary`, `bg-muted`, `bg-accent` | Chips, filas, bandas |
| Autoridad | `bg-primary` (Glacier sobre Oxford) | Footer, bandas, botón normal |
| Acción | `<Button variant="cta">` (Arctic) | **Solo** CTAs |
| Títulos | `text-heading` | Blanco en oscuro (no uses `text-primary` para títulos) |
| Alerta | `bg-destructive` (Alert Red) | Errores, < 2% del diseño |

Fuera del navegador (Open Graph, PDF, correos) se usa [src/lib/brand.ts](src/lib/brand.ts),
espejo de esas primitivas. Tipografía: Inter para texto, JetBrains Mono (`font-data`)
para datos, preguntas, resultados y precios.
