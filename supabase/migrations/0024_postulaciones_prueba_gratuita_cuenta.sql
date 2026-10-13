-- Al notificar una postulación (admin/postulantes) ahora se crea la cuenta
-- real del estudiante y se le envía la contraseña por correo — esto deja
-- de ser un simple booleano reversible. `notificado_en` registra cuándo
-- pasó (una sola vez, no se puede repetir) y `profile_id` enlaza con la
-- cuenta creada, cuando se creó una nueva (null si el correo ya tenía
-- cuenta). Pegar en Supabase SQL Editor. Requiere 0001..0023 ya aplicadas.

alter table public.postulaciones_prueba_gratuita
  add column notificado_en timestamptz,
  add column profile_id uuid references public.profiles (id) on delete set null;

create index postulaciones_prueba_gratuita_profile_id_idx
  on public.postulaciones_prueba_gratuita (profile_id);
