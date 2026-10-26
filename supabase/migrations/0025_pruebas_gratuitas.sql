-- Respuestas de la prueba gratuita Saber 11 (una fila por estudiante,
-- solo se presenta una vez). `respuestas` guarda, por materia, la opción
-- elegida en cada ítem: { "matematicas": { "NDSS-M-001": "B", ... } } —
-- una materia presente en el objeto ya se envió y no se puede repetir.
-- `finalizada_en` se fija al enviar la última materia disponible; desde
-- ahí el estudiante solo puede ver su informe (src/app/prueba-gratuita).
-- El puntaje no se guarda: se recalcula contra el banco al mostrar el
-- informe. Solo escribe el service-role desde el Server Action.
-- Pegar en Supabase SQL Editor. Requiere 0001..0024 ya aplicadas.

create table public.pruebas_gratuitas (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  iniciada_en timestamptz not null default now(),
  respuestas jsonb not null default '{}'::jsonb,
  finalizada_en timestamptz
);

alter table public.pruebas_gratuitas enable row level security;

create policy "El estudiante ve su propia prueba gratuita"
  on public.pruebas_gratuitas for select
  using (profile_id = auth.uid());

create policy "Los administradores ven las pruebas gratuitas"
  on public.pruebas_gratuitas for select
  using (public.is_admin());
