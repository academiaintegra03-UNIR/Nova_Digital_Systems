-- Materias por grupo (cada grupo tiene sus propias materias) y
-- actividades/entregas por grupo+materia. Pegar en Supabase SQL Editor.
-- Requiere 0001..0015 ya aplicadas.

create table public.grupo_materias (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  materia_id uuid not null references public.materias (id),
  -- Denormalizado desde grupos.tutor_id al momento de insertar — evita que
  -- la policy de tutor tenga que hacer join a grupos (mismo criterio que
  -- clases.tutor_id en 0015, para no repetir el tipo de recursión de RLS
  -- que tocó arreglar en 0010).
  tutor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (grupo_id, materia_id)
);

-- Backfill: las clases ya sembradas/creadas antes de esta migración no
-- tenían un vínculo explícito grupo→materia, solo lo implícito de
-- clases.materia_id. Se materializa ese vínculo para que no queden
-- huérfanas de su espacio de curso.
insert into public.grupo_materias (grupo_id, materia_id, tutor_id)
select distinct grupo_id, materia_id, tutor_id from public.clases
on conflict (grupo_id, materia_id) do nothing;

alter table public.grupo_materias enable row level security;

create policy "Los administradores gestionan grupo_materias"
  on public.grupo_materias for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Los tutores gestionan las materias de sus grupos"
  on public.grupo_materias for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create policy "Los estudiantes ven las materias de sus grupos"
  on public.grupo_materias for select
  using (grupo_id in (select public.grupo_ids_for_student(auth.uid())));

create table public.actividades (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  materia_id uuid not null references public.materias (id),
  tutor_id uuid references public.profiles (id) on delete set null,
  titulo text not null,
  descripcion text,
  fecha_limite timestamptz,
  recurso_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index actividades_grupo_materia_idx on public.actividades (grupo_id, materia_id);

create trigger actividades_set_updated_at
  before update on public.actividades
  for each row execute function public.set_updated_at();

alter table public.actividades enable row level security;

create policy "Los administradores gestionan las actividades"
  on public.actividades for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Los tutores gestionan sus propias actividades"
  on public.actividades for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create policy "Los estudiantes ven las actividades de sus grupos"
  on public.actividades for select
  using (grupo_id in (select public.grupo_ids_for_student(auth.uid())));

create table public.actividad_entregas (
  id uuid primary key default gen_random_uuid(),
  actividad_id uuid not null references public.actividades (id) on delete cascade,
  -- Denormalizado desde actividades.tutor_id al insertar — misma razón
  -- que grupo_materias.tutor_id: RLS de tutor sin join.
  tutor_id uuid references public.profiles (id) on delete set null,
  student_id uuid not null references public.profiles (id) on delete cascade,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'entregada')),
  respuesta_link text,
  entregado_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (actividad_id, student_id)
);

create trigger actividad_entregas_set_updated_at
  before update on public.actividad_entregas
  for each row execute function public.set_updated_at();

alter table public.actividad_entregas enable row level security;

create policy "Los administradores gestionan las entregas"
  on public.actividad_entregas for all
  using (public.is_admin())
  with check (public.is_admin());

-- Los tutores solo consultan (quién entregó) — el envío del estudiante
-- pasa siempre por una Server Action con el cliente admin, nunca por RLS
-- directa, mismo criterio de self-service usado en todo el proyecto.
create policy "Los tutores ven las entregas de sus actividades"
  on public.actividad_entregas for select
  using (tutor_id = auth.uid());

create policy "Los estudiantes ven sus propias entregas"
  on public.actividad_entregas for select
  using (student_id = auth.uid());
