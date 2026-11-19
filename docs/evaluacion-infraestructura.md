# Evaluación de infraestructura: Supabase y Cloudflare

Para el equipo que decide sobre la operación de la plataforma. Fecha: 18 de noviembre
de 2026.

## Conclusiones

| Pregunta | Respuesta |
|---|---|
| ¿Alcanza el plan gratuito de Supabase? | **En capacidad, probablemente sí. En continuidad, no** para operar con clientes que pagan |
| ¿Se necesitan scripts de mantenimiento? | **En el plan gratuito, sí:** copia de seguridad externa. En Pro, solo revisiones periódicas |
| ¿Conviene poner Cloudflare delante del sitio? | **Hoy no.** Si el sitio sigue en Vercel, agrega riesgo y poca protección nueva |
| ¿Hay que actuar por computación cuántica? | **No hace falta comprar nada ahora** |

**Recomendación:** pasar Supabase a **Pro (desde USD 25 al mes)** antes de matricular
estudiantes de pago en 2027, y corregir los hallazgos de seguridad de la sección 3.

**Alcance.** No se consultaron los paneles de producción ni se hizo una prueba de carga.
Las cifras de uso real se obtienen con las consultas de la sección 1.3. Los límites son
los publicados por cada proveedor en la fecha de este documento.

## 1. Supabase

### 1.1 Plan gratuito frente a Pro

| Concepto | Free | Pro |
|---|---|---|
| Precio | USD 0 | Desde USD 25 al mes |
| Base de datos | 500 MB | 8 GB, luego USD 0,125 por GB |
| Transferencia (egress) | 5 GB | 250 GB, luego USD 0,09 por GB |
| Usuarios activos al mes | 50.000 | 100.000 |
| Archivos | 1 GB | 100 GB |
| Pausa por inactividad | **Tras 1 semana** | Nunca |
| Copias automáticas | **No incluidas** | Diarias, 7 días |
| Retención de registros | 1 día | 7 días |
| Soporte por correo | No | Sí |
| Conexiones (Nano / Micro) | 60 directas, 200 por pooler | 60 directas, 200 por pooler |
| SLA de disponibilidad | No | No (solo Enterprise) |

### 1.2 Estabilidad

No encontramos cifras oficiales de disponibilidad que permitan comparar los planes, y
**ni Pro incluye un SLA de disponibilidad**. Se puede seguir el historial en
[status.supabase.com](https://status.supabase.com).

Para esta plataforma, los riesgos concretos del plan gratuito son:

1. **Sin copias de seguridad.** Un borrado accidental o una migración errada podría
   perder usuarios, pagos y resultados de forma definitiva. **Es el riesgo principal.**
2. **Pausa por inactividad.** Si el proyecto se pausa, el sitio deja de cargar datos
   hasta restaurarlo. Es poco probable con tráfico constante, pero posible en vacaciones.
3. **Registros de solo 1 día.** Un fallo reportado dos días después ya no se puede investigar.

### 1.3 Capacidad

El tamaño de los datos no parece ser el límite cercano: las tablas guardan
principalmente texto y JSON, y los bancos de preguntas viven en el código. Lo que debe
medirse es el uso real. Ejecuta esto en el **SQL Editor**:

```sql
-- Tamaño total frente a los 500 MB
select pg_size_pretty(pg_database_size(current_database())) as tamano_total;

-- Tablas más grandes
select relname as tabla,
       pg_size_pretty(pg_total_relation_size(relid)) as tamano,
       n_live_tup as filas
from pg_stat_user_tables
order by pg_total_relation_size(relid) desc
limit 10;

-- Conexiones en uso frente a las 60 disponibles
select count(*) as conexiones from pg_stat_activity;
```

| Indicador | Revisar en | Actuar cuando llegue a |
|---|---|---|
| Tamaño de la base | Consulta anterior | 350 MB (70 %) |
| Transferencia mensual | Panel, **Usage** | 3,5 GB (70 %) |
| Conexiones | Consulta anterior | 40 de forma sostenida |

**Sobre los 90 estudiantes simultáneos:** durante la prueba gratuita cada estudiante
responde en su navegador y solo escribe en la base al enviar cada materia, lo que favorece
la concurrencia. Aun así, **esto no reemplaza una prueba de carga**, que sigue pendiente
antes de una venta institucional de ese tamaño.

### 1.4 Mantenimiento

| Tarea | Frecuencia | Free | Pro |
|---|---|---|---|
| Copia externa con `supabase db dump` | Semanal | **Obligatoria** | Recomendada antes de migraciones grandes |
| Revisar las métricas de la sección 1.3 | Mensual | Sí | Sí |
| Probar la restauración de una copia | Trimestral | Sí | Sí |
| Depurar `chat_logs` antiguos | Semestral | Sí | Opcional |

Los recordatorios de clases llaman al sitio cada 10 minutos y generan actividad en la
base. Esto podría evitar la pausa, pero **Supabase no documenta ese comportamiento**, así
que no debe tomarse como garantía.

## 2. Cloudflare

### 2.1 Qué ofrece el plan gratuito

| Protección | Free | Pro (USD 20 al mes, pago anual) |
|---|---|---|
| Mitigación de DDoS | Ilimitada | Ilimitada |
| Reglas WAF administradas | Conjunto básico gratuito | Conjunto administrado y OWASP |
| Reglas de límite de peticiones | 1, solo por IP | 2 |
| Mitigación de bots | Bots simples | Bots fáciles de detectar |

### 2.2 Recomendación

**No activar el proxy de Cloudflare delante de Vercel por ahora.** La
[guía de Vercel](https://vercel.com/kb/guide/can-i-use-a-proxy-on-top-of-my-vercel-deployment)
recomienda la conexión directa y advierte sobre:

- menor visibilidad de seguridad;
- pérdida de su protección administrada contra bots;
- dos cachés independientes, con riesgo de contenido desactualizado;
- IP y ubicación del visitante alteradas. **Esto afectaría a este sitio**, porque sus
  límites de envíos se calculan por IP.

Cloudflare sí puede usarse **solo como DNS**. Conviene reconsiderar el proxy si aparecen
ataques reales o abuso que Vercel no contenga. En ese caso debe usarse el modo SSL
**Full (strict)**, porque el modo Flexible puede causar bucles de redirección.

Este análisis asume que el sitio está en Vercel, como indica el roadmap del proyecto.
**Confirma también en los términos de Vercel si el plan actual permite uso comercial.**

### 2.3 Computación cuántica

| Tramo | Estado en Cloudflare |
|---|---|
| Visitante → Cloudflare | Intercambio de claves híbrido `X25519MLKEM768` en TLS 1.3, si el navegador lo admite |
| Cloudflare → servidor de origen | Compatible, siempre que el origen también lo admita |
| Firmas y certificados poscuánticos | Autenticación del visitante todavía en desarrollo |
| Meta de Cloudflare | Toda su línea de productos poscuántica para 2029 |

**Qué significa para nosotros:** el riesgo actual es que alguien guarde hoy tráfico cifrado
para descifrarlo en el futuro. Es un riesgo bajo para esta plataforma frente a los
hallazgos de la sección 3. Además, Cloudflare solo protegería un tramo de la conexión.
Basta con mantener TLS 1.3 y revisar el tema una vez al año.

## 3. Hallazgos de seguridad en el código

Encontrados al revisar el repositorio. Estado al 18 de noviembre de 2026.

| Prioridad | Hallazgo | Riesgo | Estado |
|---|---|---|---|
| **Alta** | El checkout crea cuentas confirmadas sin verificar el correo ni limitar intentos ([`actions.ts`](../src/app/checkout/%5BplanId%5D/actions.ts)) | Alguien puede ocupar el correo de otra persona, crear cuentas en masa y descubrir qué correos están registrados | **Corregido:** la cuenta se crea al confirmarse el pago (requiere la migración 0029) |
| **Alta** | Las notas de la reunión del 28 de octubre incluyen una contraseña usada en una prueba en vivo | Acceso indebido si sigue vigente | **Cambiarla ya** y no compartir credenciales en notas |
| Media | El sitio no define encabezados de seguridad ([`next.config.ts`](../next.config.ts)) | Menor defensa frente a XSS y clickjacking | **Corregido en parte:** falta una CSP estricta para scripts |
| Media | El límite de envíos se guarda en memoria ([`rate-limit.ts`](../src/lib/rate-limit.ts)) | En servidores múltiples el límite se reparte y protege menos | **Corregido:** contador compartido en la base (requiere la migración 0031) |
| Media | La clave `service_role` se usa en 53 archivos | Un error de filtrado en uno de ellos expone datos de otros usuarios | Usar el cliente con RLS donde sea posible |
| Baja | `middleware.ts` usaba una convención obsoleta en Next.js 16 | Trabajo pendiente en una actualización futura | **Corregido:** ahora es `proxy.ts` |
| Baja | Hay dos migraciones con el número 0027 | Confusión al aplicarlas a mano | Adoptar la CLI de Supabase para las migraciones |

## 4. Plan de acción

| Cuándo | Acción | Responsable sugerido |
|---|---|---|
| **Esta semana** | Cambiar la contraseña expuesta | Administrador |
| **Esta semana** | Ejecutar las consultas de capacidad y hacer una copia con `supabase db dump` | Desarrollo |
| **Antes de desplegar** | Aplicar las migraciones 0028 a 0031 | Desarrollo |
| **Antes de matricular en 2027** | Pasar Supabase a Pro y Resend a un plan pago | Dirección |
| **Antes de una venta institucional** | Hacer una prueba de carga con 90 usuarios simultáneos | Desarrollo |

## Fuentes

- [Precios de Supabase](https://supabase.com/pricing)
- [Copias de seguridad de Supabase](https://supabase.com/docs/guides/platform/backups)
- [Cómputo y disco de Supabase](https://supabase.com/docs/guides/platform/compute-and-disk)
- [Planes de Cloudflare](https://www.cloudflare.com/plans/network-cdn.md)
- [Reglas administradas de Cloudflare](https://developers.cloudflare.com/waf/managed-rules/)
- [Límite de peticiones de Cloudflare](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [Criptografía poscuántica de Cloudflare](https://developers.cloudflare.com/ssl/post-quantum-cryptography/)
- [Poscuántica hacia el origen](https://developers.cloudflare.com/ssl/post-quantum-cryptography/pqc-to-origin/)
- [Proxy delante de Vercel](https://vercel.com/kb/guide/can-i-use-a-proxy-on-top-of-my-vercel-deployment)
- [Límites de cron en Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [Límites de Resend](https://resend.com/docs/knowledge-base/account-quotas-and-limits)
