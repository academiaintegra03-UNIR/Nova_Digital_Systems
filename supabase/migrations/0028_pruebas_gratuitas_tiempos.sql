-- Cronómetro de la prueba gratuita: segundos que el estudiante pasó en
-- cada pregunta, agrupados por materia igual que `respuestas` (0025):
-- { "matematicas": { "NDSS-M-001": 74, ... } }. Es tiempo activo — no
-- cuenta mientras la pestaña está oculta (eso ya queda como incidencia).
-- No limita al estudiante; solo alimenta el informe.
-- Las caídas de conexión no necesitan columna nueva: van en
-- `incidencias` (0026) con tipo "conexion_perdida" y `duracionSegundos`.
-- Pegar en Supabase SQL Editor. Requiere 0001..0027 ya aplicadas.

alter table public.pruebas_gratuitas
  add column tiempos jsonb not null default '{}'::jsonb;
