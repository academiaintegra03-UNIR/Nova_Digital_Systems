import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 90 se usa en la foto del hero; 75 es el valor por defecto del resto.
    qualities: [75, 90],
  },
};

export default nextConfig;
