-- Recursos académicos (links/PDFs externos) por grupo+materia. Pegar en
-- Supabase SQL Editor. Requiere 0001..0019 ya aplicadas.

create table public.materia_recursos (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  materia_id uuid not null references public.materias (id),
  -- Denormalizado desde grupos.tutor_id al insertar — mismo criterio que
  -- clases/actividades/grupo_materias/foro_hilos: RLS de tutor sin join.
  tutor_id uuid references public.profiles (id) on delete set null,
  titulo text not null,
  -- Solo para elegir el ícono correcto en la UI, no cambia el
  -- comportamiento — sigue siendo un link externo (Drive, etc.), no un
  -- archivo subido a este servidor.
  tipo text not null default 'link' check (tipo in ('pdf', 'link')),
  url text not null,
  created_at timestamptz not null default now()
);

create index materia_recursos_grupo_materia_idx on public.materia_recursos (grupo_id, materia_id);

alter table public.materia_recursos enable row level security;

create policy "Los administradores gestionan los recursos"
  on public.materia_recursos for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Los tutores gestionan los recursos de sus grupos"
  on public.materia_recursos for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create policy "Los estudiantes ven los recursos de sus grupos"
  on public.materia_recursos for select
  using (grupo_id in (select public.grupo_ids_for_student(auth.uid())));
