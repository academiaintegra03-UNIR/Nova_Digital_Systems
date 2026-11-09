import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
