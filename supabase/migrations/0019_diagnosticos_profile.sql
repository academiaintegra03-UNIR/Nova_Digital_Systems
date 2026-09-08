-- Ata (opcionalmente) un diagnóstico a la cuenta real del estudiante que
-- lo presentó, para que pueda ver su propio historial en /campus. Los
-- leads públicos anónimos (/diagnostico) siguen con profile_id null.
-- Pegar en Supabase SQL Editor. Requiere 0001..0018 ya aplicadas.

alter table public.diagnosticos
  add column profile_id uuid references public.profiles (id) on delete set null;

create index diagnosticos_profile_id_idx on public.diagnosticos (profile_id);

create policy "Los estudiantes ven sus propios diagnosticos"
  on public.diagnosticos for select
  using (profile_id = auth.uid());
