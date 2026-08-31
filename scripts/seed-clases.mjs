// Puebla materias + clases sobre los datos ya sembrados por scripts/seed.mjs
// (Colegio San José, su grupo automático, y la tutora Laura Gómez).
// Aditivo — no borra nada. Uso: node scripts/seed-clases.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const raw = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnvLocal();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL.trim(), env.SUPABASE_SERVICE_ROLE_KEY.trim(), {
  auth: { autoRefreshToken: false, persistSession: false },
});

function log(msg) {
  console.log(`- ${msg}`);
}

function daysFromNow(days, hour = 15) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

async function main() {
  const { data: colegio, error: colegioError } = await admin
    .from("profiles")
    .select("id, nombre")
    .eq("nombre", "Colegio San José")
    .single();
  if (colegioError || !colegio) {
    throw new Error("No encontré 'Colegio San José' — corre primero scripts/seed.mjs.");
  }

  const { data: grupo, error: grupoError } = await admin
    .from("grupos")
    .select("id, name, tutor_id")
    .eq("colegio_id", colegio.id)
    .eq("es_default_colegio", true)
    .single();
  if (grupoError || !grupo) throw new Error("No encontré el grupo automático de Colegio San José.");

  log(`Grupo: ${grupo.name} (tutor: ${grupo.tutor_id ?? "sin asignar"})`);

  const { data: materias, error: materiasError } = await admin
    .from("materias")
    .upsert([{ name: "Matemáticas" }, { name: "Física" }], { onConflict: "name", ignoreDuplicates: false })
    .select("id, name");
  if (materiasError) throw materiasError;
  const matematicas = materias.find((m) => m.name === "Matemáticas");
  const fisica = materias.find((m) => m.name === "Física");
  log(`Materias listas: ${materias.map((m) => m.name).join(", ")}`);

  const clases = [
    {
      grupo_id: grupo.id,
      materia_id: matematicas.id,
      tutor_id: grupo.tutor_id,
      nombre: "Clase 1: Ecuaciones lineales",
      scheduled_at: daysFromNow(2, 15),
      duration_minutes: 60,
      meeting_link: "https://meet.google.com/abc-defg-hij",
      recording_link: null,
    },
    {
      grupo_id: grupo.id,
      materia_id: fisica.id,
      tutor_id: grupo.tutor_id,
      nombre: "Clase 1: Cinemática — movimiento rectilíneo",
      scheduled_at: daysFromNow(4, 10),
      duration_minutes: 60,
      meeting_link: "https://meet.google.com/klm-nopq-rst",
      recording_link: null,
    },
    {
      grupo_id: grupo.id,
      materia_id: matematicas.id,
      tutor_id: grupo.tutor_id,
      nombre: "Clase 0: Inducción y diagnóstico",
      scheduled_at: daysFromNow(-3, 15),
      duration_minutes: 45,
      meeting_link: "https://meet.google.com/uvw-xyza-bcd",
      recording_link: "https://drive.google.com/file/d/ejemplo-grabacion-clase-0/view",
    },
  ];

  const { error: clasesError } = await admin.from("clases").insert(clases);
  if (clasesError) throw clasesError;
  clases.forEach((c) => log(`Clase creada: ${c.nombre} — ${c.scheduled_at}`));

  console.log("\nListo. Revisa /tutores (Laura Gómez), /admin/clases y /campus/mis-clases (estudiantes de ese grupo).");
}

main().catch((err) => {
  console.error("\nFalló el seed de clases:", err);
  process.exit(1);
});
