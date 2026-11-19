-- Límite de intentos compartido entre todas las instancias del servidor. El
-- contador en memoria se reparte entre instancias y se pierde en cada arranque.
--
-- Tabla `unlogged`: es más rápida y perder los contadores tras una caída de la
-- base solo reinicia las ventanas. `clave` llega como hash, sin IP ni correo.
-- Pegar en Supabase SQL Editor. Requiere 0001..0030 ya aplicadas.

create unlogged table public.rate_limit_contadores (
  clave text primary key,
  conteo integer not null,
  ventana_inicio timestamptz not null
);

create index rate_limit_contadores_ventana_idx on public.rate_limit_contadores (ventana_inicio);

alter table public.rate_limit_contadores enable row level security;

-- Suma un intento de forma atómica y devuelve true si ya superó el límite.
create function public.consumir_rate_limit(p_clave text, p_limite integer, p_ventana_ms integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_ahora constant timestamptz := now();
  v_ventana constant interval := p_ventana_ms * interval '1 millisecond';
  v_conteo integer;
begin
  insert into public.rate_limit_contadores as c (clave, conteo, ventana_inicio)
  values (p_clave, 1, v_ahora)
  on conflict (clave) do update
  set conteo = case when c.ventana_inicio <= v_ahora - v_ventana then 1 else c.conteo + 1 end,
      ventana_inicio = case when c.ventana_inicio <= v_ahora - v_ventana then v_ahora else c.ventana_inicio end
  returning c.conteo into v_conteo;

  -- Limpieza ocasional, para no necesitar una tarea programada aparte.
  if random() < 0.01 then
    delete from public.rate_limit_contadores where ventana_inicio < v_ahora - interval '2 days';
  end if;

  return v_conteo > p_limite;
end;
$$;

revoke all on function public.consumir_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consumir_rate_limit(text, integer, integer) to service_role;
