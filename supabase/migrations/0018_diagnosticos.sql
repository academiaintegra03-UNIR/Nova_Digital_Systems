-- Resultados de la batería diagnóstica pública (/diagnostico). Contiene
-- PII de leads (posiblemente menores de edad, vía su acudiente) — mismo
-- criterio que chat_logs (0002): solo admin lee, sin policy de insert
-- porque solo escribe el service-role desde el Route Handler.
-- Pegar en Supabase SQL Editor. Requiere 0001..0017 ya aplicadas.

create table public.diagnosticos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  banco_id text not null check (banco_id in ('general', 'noveno', 'decimo')),
  grado text,
  estudiante_nombre text not null,
  estudiante_edad integer,
  estudiante_email text,
  colegio text,
  acudiente_email text,
  acudiente_telefono text,
  aciertos integer not null,
  total_preguntas integer not null,
  puntaje_global integer not null,
  enfoque_score integer not null,
  desenfoques_count integer not null default 0,
  perfil_dominante text,
  desglose_materias jsonb not null default '[]'::jsonb,
  analisis_ia text
);

create index diagnosticos_created_at_idx on public.diagnosticos (created_at desc);

alter table public.diagnosticos enable row level security;

create policy "Los administradores ven los diagnosticos"
  on public.diagnosticos for select
  using (public.is_admin());
