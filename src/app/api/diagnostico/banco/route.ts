import { NextResponse, type NextRequest } from "next/server";
import { getBancoPublico, getCronometroMinutos, resolverBancoIdPermitido } from "@/lib/diagnostico/bancos";

export const runtime = "nodejs";

/** Preguntas del banco elegido explícitamente por el estudiante (selector
 * visible, no un PIN oculto) — sin clave correcta ni perfiles, para que el
 * navegador nunca tenga la respuesta en el bundle. Los cursos por grado
 * (9°/10°) son pagos — si quien pide no tiene matrícula activa, se le
 * sirve la Batería General en su lugar (resuelto en el servidor). */
export async function GET(request: NextRequest) {
  const idParam = request.nextUrl.searchParams.get("id") ?? "";
  const bancoId = await resolverBancoIdPermitido(idParam);

  return NextResponse.json({
    bancoId,
    cronometroMinutos: getCronometroMinutos(bancoId),
    preguntas: getBancoPublico(bancoId),
  });
}
