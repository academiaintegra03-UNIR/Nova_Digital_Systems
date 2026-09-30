import "server-only";
import type { BancoId, Opcion, PreguntaDiagnostico, PreguntaPublica } from "@/lib/diagnostico/types";
import { toPreguntaPublica } from "@/lib/diagnostico/types";
import generalRaw from "@/lib/diagnostico/bancos/general.json";
import novenoRaw from "@/lib/diagnostico/bancos/noveno.json";
import decimoRaw from "@/lib/diagnostico/bancos/decimo.json";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import { getActiveSubscription } from "@/lib/queries/subscription";

const OPCIONES: Opcion[] = ["A", "B", "C", "D"];

/** Algunos reactivos de 9°/10° traen el `enunciado` fuente con una URL de
 * imagen (Cloudinary) pegada al inicio del texto, ej.:
 * "https://res.cloudinary.com/.../foo.png Observa la tabla...". Sin esto,
 * el estudiante vería el link crudo como si fuera parte del enunciado en
 * vez de la imagen. Se separa una sola vez al normalizar el banco. */
const IMAGEN_AL_INICIO_REGEX = /^(https:\/\/\S+\.(?:png|jpe?g|webp|gif|svg))\s+/i;

function extraerImagenEnunciado(enunciadoCrudo: string): { enunciado: string; imagenUrl?: string } {
  const match = enunciadoCrudo.match(IMAGEN_AL_INICIO_REGEX);
  if (!match) return { enunciado: enunciadoCrudo };
  return { enunciado: enunciadoCrudo.slice(match[0].length), imagenUrl: match[1] };
}

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
  return items.map((item) => {
    const { enunciado, imagenUrl } = extraerImagenEnunciado(item.enunciado);
    return {
      id: String(item.id),
      materia: item.materia,
      enunciado,
      imagenUrl,
      opciones: item.opciones,
      claveCorrecta: item.clave,
      perfilPorOpcion: Object.fromEntries(
        OPCIONES.map((op) => [op, item.explicaciones_distractores[op]?.perfil])
      ) as PreguntaDiagnostico["perfilPorOpcion"],
      requiereJustificacion: item.requiereJustificacion ?? false,
    };
  });
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

    const { enunciado, imagenUrl } = extraerImagenEnunciado(item.enunciado);
    return {
      id: item.id,
      materia: item.materia,
      enunciado,
      imagenUrl,
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

/**
 * Los cursos Pre-ICFES por grado (9°/10°) son contenido pago — requieren
 * matrícula (una suscripción individual activa). La Batería General
 * siempre es gratuita y pública. Esto se resuelve en el servidor (no se
 * confía en lo que mande el cliente) tanto al servir las preguntas como
 * al calificar el envío, para que no sea solo un filtro de interfaz.
 */
export async function resolverBancoIdPermitido(bancoIdSolicitado: string): Promise<BancoId> {
  const bancoId = esBancoId(bancoIdSolicitado) ? bancoIdSolicitado : "general";
  if (bancoId === "general") return "general";

  const profile = await getAuthenticatedProfile();
  if (!profile || profile.role !== "estudiante") return "general";

  const sub = await getActiveSubscription(profile.id, "individual");
  return sub ? bancoId : "general";
}
