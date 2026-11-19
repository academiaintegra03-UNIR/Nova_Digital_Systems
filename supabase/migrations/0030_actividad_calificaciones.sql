-- Calificación de las entregas de actividades, en escala de 0.0 a 5.0. La
-- escribe el tutor dueño de la actividad desde una Server Action; el
-- estudiante la lee con la policy existente sobre sus propias entregas (0016).
-- Pegar en Supabase SQL Editor. Requiere 0001..0029 ya aplicadas.

alter table public.actividad_entregas
  add column nota numeric(2, 1) check (nota between 0 and 5),
  add column comentario text check (char_length(comentario) <= 1000),
  add column calificada_at timestamptz,
  add column calificada_por uuid references public.profiles (id) on delete set null;

create index actividad_entregas_por_calificar_idx
  on public.actividad_entregas (tutor_id, entregado_at)
  where estado = 'entregada' and nota is null;
