import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { procesarRecordatoriosClases } from "@/lib/recordatorios-clases";

export const runtime = "nodejs";
export const maxDuration = 60;

const SIN_CACHE = { "Cache-Control": "no-store" };

/** Compara los hashes para que el tiempo de respuesta no revele el secreto
 * ni su longitud. */
function esPeticionAutorizada(request: NextRequest, secreto: string) {
  const hash = (valor: string) => createHash("sha256").update(valor).digest();
  const recibido = request.headers.get("authorization") ?? "";
  return timingSafeEqual(hash(recibido), hash(`Bearer ${secreto}`));
}

/**
 * Lo invoca un programador externo cada 10 minutos (ver
 * docs/recordatorios-clases.md). Sin CRON_SECRET configurado la ruta queda
 * cerrada. Acepta GET porque es el método que usa Vercel Cron.
 */
async function ejecutar(request: NextRequest) {
  const secreto = process.env.CRON_SECRET?.trim();
  if (!secreto) {
    console.error("CRON_SECRET is not set.");
    return NextResponse.json({ error: "Not configured" }, { status: 503, headers: SIN_CACHE });
  }
  if (!esPeticionAutorizada(request, secreto)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: SIN_CACHE });
  }

  try {
    const resumen = await procesarRecordatoriosClases();
    if (resumen.detenidoPor) console.error("Recordatorios de clases detenidos:", resumen.detenidoPor);
    return NextResponse.json(resumen, { headers: SIN_CACHE });
  } catch (error) {
    console.error("Failed to process recordatorios de clases:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500, headers: SIN_CACHE });
  }
}

export const GET = ejecutar;
export const POST = ejecutar;
