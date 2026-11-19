import type { NextConfig } from "next";

// Sin `script-src` a propósito: Next.js usa scripts en línea y una política
// estricta requiere nonces. Estas directivas no pueden romper la página.
const CONTENT_SECURITY_POLICY = "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'";

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  images: {
    // 90 se usa en la foto del hero; 75 es el valor por defecto del resto.
    qualities: [75, 90],
  },
  // Los resultados Saber 11 se leen con fs (src/lib/saber11/data.ts), así que
  // el trazado automático no los ve: hay que incluirlos a mano.
  outputFileTracingIncludes: {
    "/alianza-colegios": ["./src/lib/saber11/colegios.json"],
    "/alianza-colegios/*": ["./src/lib/saber11/colegios.json"],
  },
};

export default nextConfig;
