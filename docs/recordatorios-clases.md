# Recordatorios de clases por correo

Avisa a cada estudiante de un grupo antes de sus clases programadas. Última
revisión: 18 de noviembre de 2026.

## Qué recibe el estudiante

| Aviso | Cuándo se genera | Contenido |
|---|---|---|
| `24h` | Faltan entre 2 y 24 horas | Clase, materia, fecha en hora de Colombia, duración y botón |
| `1h` | Falta una hora o menos | Los mismos datos, con el asunto "Tu clase empieza pronto" |

- Si la clase se crea cuando faltan entre 1 y 2 horas, solo sale el aviso de 1 h.
  Así no llegan dos correos seguidos.
- Si la clase se **reprograma**, se vuelve a avisar con el horario nuevo.
- Si la clase se elimina, o el estudiante sale del grupo, lo pendiente se descarta.
- El botón abre `meeting_link` cuando es un enlace http(s). Si no, lleva a
  `/campus/mis-clases`.

## Cómo funciona

```text
Programador (cada 10 min)
   │  POST con Authorization: Bearer CRON_SECRET
   ▼
/api/cron/recordatorios-clases
   │  reclamar_recordatorios_clases(50)   ← genera avisos y reparte un lote
   ▼
procesarRecordatoriosClases → Resend (un correo a la vez)
   │
   ▼
clase_recordatorios (enviado / pendiente / fallido / descartado)
```

| Pieza | Archivo |
|---|---|
| Tabla y funciones SQL | [`0028_clase_recordatorios.sql`](../supabase/migrations/0028_clase_recordatorios.sql) |
| Ruta protegida | [`route.ts`](../src/app/api/cron/recordatorios-clases/route.ts) |
| Envío por lotes | [`recordatorios-clases.ts`](../src/lib/recordatorios-clases.ts) |
| Plantilla del correo | [`send-recordatorio-clase.ts`](../src/lib/email/send-recordatorio-clase.ts) |

### Garantías

- **Sin duplicados.** Hay una fila única por clase, estudiante, tipo y fecha.
  El reparto usa `for update skip locked`, y cada correo lleva una llave de
  idempotencia que Resend respeta durante 24 horas.
- **Reintentos.** Un error temporal se reintenta cada 10 minutos, hasta 3 veces.
- **Cuota agotada.** Si Resend rechaza por cuota, límite de peticiones o
  credenciales, la pasada se detiene y el lote vuelve a la cola sin gastar intentos.
- **Seguridad.** La ruta queda cerrada si falta `CRON_SECRET`. Las funciones SQL
  solo las ejecuta `service_role`, y la tabla tiene RLS sin policies.
- **Privacidad.** La tabla guarda códigos de error, nunca el contenido del correo,
  y las filas se borran a los 90 días.

## Puesta en marcha

Hazlo en este orden. Hasta el paso 4 no sale ningún correo.

### 1. Aplicar las migraciones

En Supabase, **SQL Editor**, pega y ejecuta las que falten, en orden numérico. La
última es `0028_clase_recordatorios.sql`.

### 2. Crear el secreto

```bash
openssl rand -hex 32
```

### 3. Configurar las variables del sitio

En el proveedor donde está desplegado el sitio, y luego vuelve a desplegar:

| Variable | Valor |
|---|---|
| `CRON_SECRET` | El secreto del paso 2 |
| `RESEND_API_KEY` | Llave de Resend (ya usada por los demás correos) |
| `RESEND_FROM_EMAIL` | Remitente verificado en Resend |

### 4. Programar la ejecución

Usamos Supabase Cron porque el plan gratuito de Vercel solo permite cron una vez
al día, y aquí se necesita cada 10 minutos. Ejecuta esto en el **SQL Editor**,
reemplazando `<CRON_SECRET>`:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select vault.create_secret(
  'https://soberanocognitivo.com/api/cron/recordatorios-clases',
  'recordatorios_clases_url'
);
select vault.create_secret('<CRON_SECRET>', 'recordatorios_clases_secret');

select cron.schedule(
  'recordatorios-clases',
  '*/10 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'recordatorios_clases_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'recordatorios_clases_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
```

`pg_net` guarda el encabezado en `net.http_request_queue` mientras la petición
espera. No compartas accesos a la base de datos con quien no deba ver ese secreto.

### 5. Probar

```bash
curl -i -X POST https://soberanocognitivo.com/api/cron/recordatorios-clases \
  -H "Authorization: Bearer <CRON_SECRET>"
```

Respuesta esperada: `200` con un resumen como este.

```json
{ "reclamados": 2, "enviados": 2, "fallidos": 0, "reintentos": 0, "liberados": 0, "detenidoPor": null }
```

Para una prueba real, crea una clase de un grupo con tu propio correo, programada
a 3 horas. Debe llegar el aviso de 24 h en la siguiente pasada.

## Capacidad y costos

El plan gratuito de Resend permite **100 correos al día y 3.000 al mes**. Esa cuota
la comparten todos los correos del sitio: contraseñas, recibos, informes y
recordatorios.

```text
Correos al mes = estudiantes × clases al mes por estudiante × 2
```

| Estudiantes | Clases al mes | Correos al mes | ¿Cabe en el plan gratuito? |
|---:|---:|---:|---|
| 10 | 8 | 160 | Sí |
| 40 | 12 | 960 | Sí, si no coinciden más de 50 estudiantes el mismo día |
| 90 | 12 | 2.160 | **No:** 90 estudiantes en un día son 180 correos |

Antes de operar con más de unos 40 estudiantes activos, pasa a un plan pago de
Resend. De lo contrario, un día con muchas clases puede dejar sin cuota los correos
de contraseñas y recibos.

El sistema envía hasta 300 correos por hora. Un grupo de 90 estudiantes tarda dos
pasadas, unos 20 minutos.

## Operación

**Estado de las últimas 24 horas**

```sql
select tipo, estado, count(*)
from public.clase_recordatorios
where created_at > now() - interval '24 hours'
group by 1, 2
order by 1, 2;
```

**Errores recientes**

```sql
select ultimo_error, estado, count(*)
from public.clase_recordatorios
where ultimo_error is not null and created_at > now() - interval '7 days'
group by 1, 2
order by 3 desc;
```

**¿Se está ejecutando el programador?**

```sql
select status, return_message, start_time
from cron.job_run_details
where jobid = (select jobid from cron.job where jobname = 'recordatorios-clases')
order by start_time desc
limit 10;

select status_code, timed_out, error_msg, created
from net._http_response
order by created desc
limit 10;
```

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Respuesta `401` | `CRON_SECRET` distinto en el sitio y en Vault | Igualar los dos valores |
| Respuesta `503` | Falta `CRON_SECRET` en el sitio | Configurarlo y volver a desplegar |
| Respuesta `500` | Falta Resend o la migración 0028 | Revisar variables y migraciones |
| `detenidoPor: daily_quota_exceeded` | Se agotó la cuota diaria | Se reanuda solo al reiniciarse la cuota; evaluar plan pago |
| Filas `pendiente` que no avanzan | El programador no corre | Revisar `cron.job_run_details` |
| Filas `fallido` | Dirección inválida o rechazo del proveedor | Consultar `ultimo_error` y corregir el correo |

## Pausar o retirar

**Pausar** los envíos:

```sql
select cron.unschedule('recordatorios-clases');
```

**Retirar** la función por completo, después de pausarla:

```sql
drop function public.reclamar_recordatorios_clases(integer, timestamptz);
drop function public.liberar_recordatorios_clases(uuid[]);
drop table public.clase_recordatorios;
```

## Límites actuales

- Solo se avisa a estudiantes, no a acudientes ni tutores.
- La hora siempre se muestra en hora de Colombia, porque el perfil no guarda zona horaria.
- Los estudiantes no pueden desactivar estos avisos desde su cuenta.
