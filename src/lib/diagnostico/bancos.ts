import "server-only";
import type { BancoId, Opcion, PreguntaDiagnostico, PreguntaPublica } from "@/lib/diagnostico/types";
import { toPreguntaPublica } from "@/lib/diagnostico/types";
import generalRaw from "@/lib/diagnostico/bancos/general.json";
import novenoRaw from "@/lib/diagnostico/bancos/noveno.json";
import decimoRaw from "@/lib/diagnostico/bancos/decimo.json";

const OPCIONES: Opcion[] = ["A", "B", "C", "D"];

interface GeneralRawItem {
  id: number;
  materia: string;
  enunciado: string;
  opciones: Record<Opcion, string>;
  clave: Opcion;
  explicaciones_distractores: Record<Opcion, { perfil: string; detalle: string }>;
  requiereJustificacion?: boolean;
}

interface GradoRawItem {
  id: string;
  materia: string;
  enunciado: string;
  opciones: Record<Opcion, string>;
  comentarios: Record<Opcion, { estudiante: string; pedagogico: string }>;
}

function normalizarGeneral(items: GeneralRawItem[]): PreguntaDiagnostico[] {
  return items.map((item) => ({
    id: String(item.id),
    materia: item.materia,
    enunciado: item.enunciado,
    opciones: item.opciones,
    claveCorrecta: item.clave,
    perfilPorOpcion: Object.fromEntries(
      OPCIONES.map((op) => [op, item.explicaciones_distractores[op]?.perfil])
    ) as PreguntaDiagnostico["perfilPorOpcion"],
    requiereJustificacion: item.requiereJustificacion ?? false,
  }));
}

/** 9°/10°: sin `clave` explícita — la opción correcta es la que trae
 * `comentarios.<letra>.estudiante === "opción correcta"`. Sin datos de
 * perfil en estos bancos — se deja `perfilPorOpcion` sin definir. */
function normalizarGradoEspecifico(items: GradoRawItem[]): PreguntaDiagnostico[] {
  return items.map((item) => {
    const correcta = OPCIONES.find((op) =>
      (item.comentarios[op]?.estudiante ?? "").toLowerCase().includes("correcta")
    );
    if (!correcta) throw new Error(`Pregunta ${item.id} sin opción correcta marcada.`);

    return {
      id: item.id,
      materia: item.materia,
      enunciado: item.enunciado,
      opciones: item.opciones,
      claveCorrecta: correcta,
    };
  });
}

const BANCOS: Record<BancoId, PreguntaDiagnostico[]> = {
  general: normalizarGeneral(generalRaw as GeneralRawItem[]),
  noveno: normalizarGradoEspecifico(novenoRaw as GradoRawItem[]),
  decimo: normalizarGradoEspecifico(decimoRaw as GradoRawItem[]),
};

const CRONOMETRO_MINUTOS: Record<BancoId, number> = {
  general: 14,
  noveno: 72,
  decimo: 120,
};

export function getBanco(bancoId: BancoId): PreguntaDiagnostico[] {
  return BANCOS[bancoId];
}

export function getBancoPublico(bancoId: BancoId): PreguntaPublica[] {
  return BANCOS[bancoId].map(toPreguntaPublica);
}

export function getCronometroMinutos(bancoId: BancoId): number {
  return CRONOMETRO_MINUTOS[bancoId];
}

export function esBancoId(value: string): value is BancoId {
  return value === "general" || value === "noveno" || value === "decimo";
}
