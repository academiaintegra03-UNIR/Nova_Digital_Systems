-- Foro de preguntas por grupo+materia (hilos + mensajes). Pegar en
-- Supabase SQL Editor. Requiere 0001..0016 ya aplicadas.

create table public.foro_hilos (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  materia_id uuid not null references public.materias (id),
  -- Denormalizado desde grupos.tutor_id al insertar — misma razón que
  -- clases/actividades/grupo_materias: RLS de tutor sin join.
  tutor_id uuid references public.profiles (id) on delete set null,
  autor_id uuid references public.profiles (id) on delete set null,
  titulo text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index foro_hilos_grupo_materia_idx on public.foro_hilos (grupo_id, materia_id);

create trigger foro_hilos_set_updated_at
  before update on public.foro_hilos
  for each row execute function public.set_updated_at();

alter table public.foro_hilos enable row level security;

create policy "Los administradores gestionan los hilos"
  on public.foro_hilos for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Los tutores gestionan los hilos de sus grupos"
  on public.foro_hilos for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create policy "Los estudiantes ven los hilos de sus grupos"
  on public.foro_hilos for select
  using (grupo_id in (select public.grupo_ids_for_student(auth.uid())));

create table public.foro_mensajes (
  id uuid primary key default gen_random_uuid(),
  hilo_id uuid not null references public.foro_hilos (id) on delete cascade,
  -- Denormalizado desde foro_hilos.tutor_id al insertar — misma razón.
  tutor_id uuid references public.profiles (id) on delete set null,
  autor_id uuid references public.profiles (id) on delete set null,
  mensaje text not null,
  created_at timestamptz not null default now()
);

create index foro_mensajes_hilo_id_idx on public.foro_mensajes (hilo_id);

alter table public.foro_mensajes enable row level security;

create policy "Los administradores gestionan los mensajes"
  on public.foro_mensajes for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Los tutores gestionan los mensajes de sus hilos"
  on public.foro_mensajes for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

-- foro_mensajes no tiene grupo_id propio — se llega a él vía su hilo.
-- Es un join a foro_hilos en una sola dirección (foro_hilos no vuelve a
-- consultar foro_mensajes en su propia policy), así que no repite el
-- ciclo de recursión que tocó arreglar en 0010.
create policy "Los estudiantes ven los mensajes de los hilos de sus grupos"
  on public.foro_mensajes for select
  using (
    hilo_id in (
      select id from public.foro_hilos
      where grupo_id in (select public.grupo_ids_for_student(auth.uid()))
    )
  );
