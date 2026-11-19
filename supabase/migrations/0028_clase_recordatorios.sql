-- Recordatorios por correo de las clases programadas (24 h y 1 h antes).
-- Guía de operación: docs/recordatorios-clases.md.
--
-- `clase_recordatorios` es la bitácora de envíos y a la vez el candado que
-- evita duplicados: hay una fila por clase + estudiante + tipo + fecha de la
-- clase. La fecha hace parte de la clave para que una clase reprogramada
-- vuelva a avisar con el horario nuevo.
--
-- Solo la usa el service-role desde /api/cron/recordatorios-clases: RLS
-- activo y sin policies, porque guarda a quién se le escribió y cuándo.
-- Pegar en Supabase SQL Editor. Requiere 0001..0027 ya aplicadas.

create table public.clase_recordatorios (
  id uuid primary key default gen_random_uuid(),
  clase_id uuid not null references public.clases (id) on delete cascade,
  destinatario_id uuid not null references public.profiles (id) on delete cascade,
  tipo text not null check (tipo in ('24h', '1h')),
  clase_scheduled_at timestamptz not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'enviado', 'fallido', 'descartado')),
  intentos smallint not null default 0,
  -- Mientras esté vigente, otra ejecución no toma la fila. Si el proceso
  -- muere a mitad de camino, la fila se reintenta al vencer.
  bloqueado_hasta timestamptz,
  -- Solo el código de error del proveedor, nunca datos personales.
  ultimo_error text,
  proveedor_id text,
  enviado_en timestamptz,
  created_at timestamptz not null default now(),
  constraint clase_recordatorios_unico unique (clase_id, destinatario_id, tipo, clase_scheduled_at)
);

create index clase_recordatorios_pendientes_idx
  on public.clase_recordatorios (clase_scheduled_at)
  where estado = 'pendiente';
create index clase_recordatorios_destinatario_id_idx on public.clase_recordatorios (destinatario_id);
create index clase_recordatorios_created_at_idx on public.clase_recordatorios (created_at);

alter table public.clase_recordatorios enable row level security;

-- Genera los recordatorios que ya corresponden y reclama un lote para enviar.
-- Todo ocurre en una transacción y con `skip locked`, así que dos ejecuciones
-- simultáneas nunca reciben la misma fila.
--
-- Ventanas: "24h" cuando faltan entre 2 y 24 horas, "1h" cuando falta una hora
-- o menos. Entre 1 y 2 horas no se genera nada, para no mandar dos correos
-- seguidos de una clase creada a última hora.
--
-- Es security definer porque el correo vive en auth.users; por eso solo la
-- puede ejecutar el service-role (ver los grants al final).
create function public.reclamar_recordatorios_clases(
  p_limite integer default 50,
  p_ahora timestamptz default now()
)
returns table (
  recordatorio_id uuid,
  tipo text,
  intentos smallint,
  clase_nombre text,
  materia_nombre text,
  scheduled_at timestamptz,
  duration_minutes integer,
  meeting_link text,
  destinatario_nombre text,
  destinatario_email text
)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  c_max_intentos constant smallint := 3;
  c_bloqueo constant interval := interval '10 minutes';
  c_retencion constant interval := interval '90 days';
begin
  insert into public.clase_recordatorios (clase_id, destinatario_id, tipo, clase_scheduled_at)
  select c.id, ge.student_id, v.tipo, c.scheduled_at
  from public.clases c
  join public.grupo_estudiantes ge on ge.grupo_id = c.grupo_id
  cross join lateral (
    select case
      when c.scheduled_at <= p_ahora + interval '1 hour' then '1h'
      when c.scheduled_at > p_ahora + interval '2 hours' then '24h'
    end as tipo
  ) v
  where c.scheduled_at > p_ahora
    and c.scheduled_at <= p_ahora + interval '24 hours'
    and v.tipo is not null
  on conflict on constraint clase_recordatorios_unico do nothing;

  -- Ya no aplican: la clase cambió de hora o pasó, el estudiante salió del
  -- grupo, no tiene correo, o un aviso de 24 h se atrasó hasta la última hora.
  update public.clase_recordatorios r
  set estado = 'descartado', bloqueado_hasta = null
  where r.estado = 'pendiente'
    and (
      r.clase_scheduled_at <= p_ahora
      or (r.tipo = '24h' and r.clase_scheduled_at <= p_ahora + interval '1 hour')
      or not exists (
        select 1
        from public.clases c
        join public.grupo_estudiantes ge on ge.grupo_id = c.grupo_id
        join auth.users u on u.id = ge.student_id
        where c.id = r.clase_id
          and c.scheduled_at = r.clase_scheduled_at
          and ge.student_id = r.destinatario_id
          and u.email is not null
      )
    );

  update public.clase_recordatorios r
  set estado = 'fallido', bloqueado_hasta = null
  where r.estado = 'pendiente'
    and r.intentos >= c_max_intentos
    and (r.bloqueado_hasta is null or r.bloqueado_hasta <= p_ahora);

  delete from public.clase_recordatorios r where r.created_at < p_ahora - c_retencion;

  return query
  with candidatos as (
    select r.id
    from public.clase_recordatorios r
    where r.estado = 'pendiente'
      and (r.bloqueado_hasta is null or r.bloqueado_hasta <= p_ahora)
    order by r.clase_scheduled_at
    limit least(greatest(p_limite, 1), 100)
    for update of r skip locked
  ),
  reclamados as (
    update public.clase_recordatorios r
    set intentos = r.intentos + 1, bloqueado_hasta = p_ahora + c_bloqueo
    from candidatos
    where r.id = candidatos.id
    returning r.id, r.tipo, r.intentos, r.clase_id, r.destinatario_id
  )
  select
    rc.id,
    rc.tipo,
    rc.intentos,
    c.nombre,
    m.name,
    c.scheduled_at,
    c.duration_minutes,
    c.meeting_link,
    p.nombre,
    u.email::text
  from reclamados rc
  join public.clases c on c.id = rc.clase_id
  join public.materias m on m.id = c.materia_id
  join public.profiles p on p.id = rc.destinatario_id
  join auth.users u on u.id = rc.destinatario_id
  order by c.scheduled_at;
end;
$$;

-- Devuelve filas reclamadas que no se alcanzaron a enviar (cuota agotada o
-- tiempo de ejecución cumplido) sin gastarles un intento.
create function public.liberar_recordatorios_clases(p_ids uuid[])
returns void
language sql
security definer
set search_path = ''
as $$
  update public.clase_recordatorios
  set intentos = greatest(intentos - 1, 0), bloqueado_hasta = null
  where id = any (p_ids) and estado = 'pendiente';
$$;

revoke all on function public.reclamar_recordatorios_clases(integer, timestamptz) from public, anon, authenticated;
revoke all on function public.liberar_recordatorios_clases(uuid[]) from public, anon, authenticated;
grant execute on function public.reclamar_recordatorios_clases(integer, timestamptz) to service_role;
grant execute on function public.liberar_recordatorios_clases(uuid[]) to service_role;
