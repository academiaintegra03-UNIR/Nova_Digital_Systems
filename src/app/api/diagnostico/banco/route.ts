import { NextResponse, type NextRequest } from "next/server";
import { getBancoPublico, getCronometroMinutos, esBancoId } from "@/lib/diagnostico/bancos";

export const runtime = "nodejs";

/** Preguntas del banco elegido explícitamente por el estudiante (selector
 * visible, no un PIN oculto) — sin clave correcta ni perfiles, para que el
 * navegador nunca tenga la respuesta en el bundle. */
export async function GET(request: NextRequest) {
  const idParam = request.nextUrl.searchParams.get("id") ?? "";
  const bancoId = esBancoId(idParam) ? idParam : "general";

  return NextResponse.json({
    bancoId,
    cronometroMinutos: getCronometroMinutos(bancoId),
    preguntas: getBancoPublico(bancoId),
  });
}
