-- Tiempo que tardó el estudiante en cada materia de la prueba gratuita,
-- en segundos: { "matematicas": 1312, "ingles": 845, ... }. Lo mide el
-- cronómetro del navegador desde que pulsa "Comenzar" hasta que envía la
-- materia; se acumula al enviar cada una. El informe muestra el total y
-- el de cada materia. Las pruebas anteriores a esta columna quedan en '{}'
-- y el informe simplemente no muestra tiempo.
-- Pegar en Supabase SQL Editor. Requiere 0001..0026 ya aplicadas.

alter table public.pruebas_gratuitas
  add column if not exists tiempos jsonb not null default '{}'::jsonb;
