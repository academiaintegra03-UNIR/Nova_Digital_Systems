-- Materias (catálogo) y clases programadas por grupo. Pegar en Supabase
-- SQL Editor. Requiere 0001..0014 ya aplicadas.

create table public.materias (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.materias enable row level security;

-- Catálogo sin dato sensible — cualquier usuario autenticado lo lee,
-- mismo criterio que los planes públicos (0005).
create policy "Cualquiera autenticado ve las materias"
  on public.materias for select
  to authenticated
  using (true);

create policy "Administradores y tutores gestionan materias"
  on public.materias for all
  using (public.is_admin() or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'tutor'
  ))
  with check (public.is_admin() or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'tutor'
  ));

create table public.clases (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  materia_id uuid not null references public.materias (id),
  tutor_id uuid references public.profiles (id) on delete set null,
  nombre text not null,
  scheduled_at timestamptz not null,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  meeting_link text,
  recording_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clases_grupo_id_idx on public.clases (grupo_id);
create index clases_scheduled_at_idx on public.clases (scheduled_at);

create trigger clases_set_updated_at
  before update on public.clases
  for each row execute function public.set_updated_at();

alter table public.clases enable row level security;

create policy "Los administradores gestionan las clases"
  on public.clases for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Los tutores gestionan sus propias clases"
  on public.clases for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

-- Reusa la función security definer de 0010 (grupo_ids_for_student) —
-- evita repetir el tipo de RLS cruzada que hubo que arreglar ahí.
create policy "Los estudiantes ven las clases de sus grupos"
  on public.clases for select
  using (grupo_id in (select public.grupo_ids_for_student(auth.uid())));
