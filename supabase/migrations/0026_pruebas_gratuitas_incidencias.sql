-- Bitácora de integridad de la prueba gratuita: cada salida de pestaña e
-- intento de copiar/cortar/pegar durante la prueba, con el mismo formato
-- que diagnosticos.incidencias_log (0022) más la materia en curso:
-- [{ "timestamp", "tipo", "preguntaId", "detalle", "materia" }, ...].
-- Se acumula al enviar cada materia. Lo ve el admin en /admin/postulantes
-- y el estudiante en su informe.
-- Pegar en Supabase SQL Editor. Requiere 0001..0025 ya aplicadas.

alter table public.pruebas_gratuitas
  add column incidencias jsonb not null default '[]'::jsonb;
