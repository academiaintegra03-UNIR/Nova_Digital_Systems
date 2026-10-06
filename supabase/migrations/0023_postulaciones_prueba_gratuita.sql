-- Captura de interesados en la prueba gratuita (aún no lanzada) desde el
-- popup promocional del sitio público. Mismo criterio que diagnosticos
-- (0018): contiene PII de leads, solo admin lee, sin policy de insert
-- porque solo escribe el service-role desde el Server Action.
-- Pegar en Supabase SQL Editor. Requiere 0001..0022 ya aplicadas.

create table public.postulaciones_prueba_gratuita (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  email text not null,
  telefono text,
  notificado boolean not null default false
);

create index postulaciones_prueba_gratuita_created_at_idx
  on public.postulaciones_prueba_gratuita (created_at desc);

alter table public.postulaciones_prueba_gratuita enable row level security;

create policy "Los administradores ven las postulaciones"
  on public.postulaciones_prueba_gratuita for select
  using (public.is_admin());
