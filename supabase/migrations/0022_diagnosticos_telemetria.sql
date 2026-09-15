-- Ajusta `diagnosticos` a la especificación de cálculos de Jimmy Ramírez
-- (2026-09-04): el foco y el copiado/pegado son incidencias con peso
-- distinto (no un solo contador), hay un nivel por puntaje (Soberano/
-- Estratégico/... o Avanzado/Satisfactorio/...), y se guarda el tiempo
-- total tomado y la bitácora forense de incidencias. Pegar en Supabase
-- SQL Editor. Requiere 0001..0021 ya aplicadas.

alter table public.diagnosticos
  add column copy_paste_count integer not null default 0,
  add column tiempo_total_minutos integer,
  add column nivel_global text,
  add column incidencias_log jsonb not null default '[]'::jsonb;
