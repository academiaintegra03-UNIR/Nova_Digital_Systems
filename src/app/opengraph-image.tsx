import { BRAND } from "@/lib/brand";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoBuffer = await readFile(path.join(process.cwd(), "public", "Nova-PNG.png"));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: BRAND.oxford,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.16) 2px, transparent 2px)",
          backgroundSize: "28px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={96} height={96} style={{ borderRadius: "50%" }} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: "#ffffff" }}>Nova Digital Studio Systems</div>
            <div style={{ fontSize: 28, color: BRAND.arctic, marginTop: 4 }}>Comprende, practica y avanza</div>
          </div>
        </div>
        <div style={{ fontSize: 26, color: BRAND.onOxfordMuted, marginTop: 48, maxWidth: 820 }}>
          Matemáticas, preparación de exámenes y aprendizaje inteligente.
        </div>
      </div>
    ),
    { ...size }
  );
}
