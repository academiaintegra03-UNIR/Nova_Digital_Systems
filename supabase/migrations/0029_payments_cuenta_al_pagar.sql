-- La cuenta del comprador ahora se crea cuando Wompi confirma el pago, no al
-- abrir el checkout. Antes cualquiera podía ocupar el correo de otra persona
-- con una contraseña propia sin pagar nada.
--
-- `datos_cuenta` guarda el contacto del comprador mientras el pago está
-- pendiente ({ telefono, tipoDocumento, numeroDocumento }) y se borra al
-- activarse. `payments` ya es de solo lectura para administradores (0005).
-- Pegar en Supabase SQL Editor. Requiere 0001..0028 ya aplicadas.

alter table public.payments add column datos_cuenta jsonb;

-- El correo vive en auth.users y la API de Auth no permite buscar por correo.
-- Solo la ejecuta el service-role desde el webhook de pagos.
create function public.perfil_id_por_correo(p_email text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.id from auth.users u where lower(u.email) = lower(p_email) limit 1;
$$;

revoke all on function public.perfil_id_por_correo(text) from public, anon, authenticated;
grant execute on function public.perfil_id_por_correo(text) to service_role;
