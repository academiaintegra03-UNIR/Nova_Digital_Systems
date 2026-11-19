# Manual de usuario y funcionamiento de la plataforma

Guía para el equipo de Nova Digital Studio Systems: qué hace cada perfil, cómo se
opera el día a día y cómo funciona la plataforma por dentro. Última revisión: 18 de
noviembre de 2026.

**Contenido**

1. [Perfiles y acceso](#1-perfiles-y-acceso)
2. [Sitio público](#2-sitio-público)
3. [Administrador](#3-administrador)
4. [Tutor](#4-tutor)
5. [Estudiante](#5-estudiante)
6. [Acudiente](#6-acudiente)
7. [Colegio](#7-colegio)
8. [Flujos principales](#8-flujos-principales)
9. [Funcionamiento técnico](#9-funcionamiento-técnico)
10. [Solución de problemas](#10-solución-de-problemas)

> **Importante.** Algunas pantallas todavía muestran datos de ejemplo. Están
> marcadas con ⚠️ y no deben usarse para tomar decisiones ni mostrarse a clientes
> como información real.

## 1. Perfiles y acceso

Todos ingresan por `/login` con correo y contraseña, y llegan al panel de su rol.

| Rol | Panel | Para qué sirve |
|---|---|---|
| Administrador | `/admin` | Gestiona usuarios, grupos, clases, planes, pagos y postulantes |
| Tutor | `/tutores` | Consulta su agenda, publica actividades y recursos, y califica entregas |
| Estudiante | `/campus` | Ve sus clases y materias, entrega actividades y presenta pruebas |
| Acudiente | `/acudientes` | Acompaña a sus estudiantes vinculados |
| Colegio | `/colegios-panel` | Administra sus estudiantes y subgrupos dentro del cupo de su plan |

**Cómo se crean las cuentas**

| Origen | Rol que recibe |
|---|---|
| Administrador, en Usuarios | El que se elija |
| Pago confirmado por Wompi | Según el tipo de plan; los datos de acceso llegan por correo |
| Notificar a un postulante de la prueba gratuita | Estudiante |
| Colegio, en Estudiantes | Estudiante del colegio |
| Acudiente, al crear a su hijo o hija | Estudiante vinculado |
| Colegio, al invitar un acudiente | Acudiente vinculado |

Las contraseñas tienen mínimo 8 caracteres. La plataforma no las guarda en texto
plano: de eso se encarga Supabase Auth.

## 2. Sitio público

| Ruta | Función |
|---|---|
| `/` | Inicio. Muestra el popup de la prueba gratuita |
| `/#prueba-gratuita` | Abre directamente el popup; sirve para campañas en redes |
| `/diagnostico` | Batería diagnóstica pública |
| `/alex` | Chat de orientación con IA |
| `/planes-precios` | Planes activos y preicfes 2027 |
| `/planes-precios/grupo-reducido` | Preicfes en grupos de máximo 3 estudiantes |
| `/planes-precios/grupos-y-colegios` | Preicfes en grupos de 4 a 10 estudiantes |
| `/alianza-colegios` | Resultados Saber 11 por colegio |
| `/recursos` | Guías, videos y herramientas gratuitas |
| `/programas`, `/paises`, `/colegios`, `/nosotros`, `/faq`, `/contacto` | Información institucional |
| `/politica-de-tratamiento-de-datos` | Política de datos personales |

Las tarjetas de `/recursos` se editan en
[`src/lib/data/resources.ts`](../src/lib/data/resources.ts).

## 3. Administrador

### Menú

| Sección | Qué permite |
|---|---|
| **Resumen general** | Ver indicadores globales |
| **Usuarios** | Crear, editar y eliminar cuentas; vincular acudientes; gestionar suscripciones |
| **Grupos** | Crear grupos, asignar tutor y agregar o quitar estudiantes |
| **Materias** | Mantener el catálogo de materias |
| **Clases** | Programar clases con fecha, duración, tutor y enlaces |
| **Planes** | Crear, editar, activar y desactivar planes |
| **Pagos** | Consultar los pagos registrados |
| **Dashboard** | Analizar los diagnósticos, con filtros por banco, colegio, fecha y puntaje |
| **Prueba gratuita** | Revisar postulantes, darles acceso y ver sus informes |
| **IA (Álex)** | Ver el uso y los errores del chat de orientación |

⚠️ Las pantallas `/admin/programas`, `/admin/matriculas` y `/admin/reportes` usan
datos de ejemplo y por eso no aparecen en el menú.

### Puesta en marcha de un grupo

1. Crea los **usuarios** del tutor y de los estudiantes.
2. Verifica que exista la **materia**.
3. Crea el **grupo**, asígnale el tutor y agrega a los estudiantes.
4. Programa las **clases** con grupo, materia, nombre, fecha y enlace de reunión.
5. Después de la clase, edítala para agregar el enlace de la grabación.

Los estudiantes reciben recordatorios automáticos 24 horas y 1 hora antes, una vez
activado el sistema descrito en [recordatorios-clases.md](recordatorios-clases.md).

### Dar acceso a un postulante

1. Entra a **Prueba gratuita** y busca a la persona por nombre, correo, WhatsApp o colegio.
2. Pulsa **Notificar**. Se crea la cuenta y se le envía la contraseña por correo.
3. Cuando presente la prueba, usa **Ver informe** para revisar resultados, tiempos
   e incidencias.

Notificar **solo se puede hacer una vez** por postulación. Si el correo ya tenía
cuenta, se le avisa sin cambiar su contraseña.

## 4. Tutor

| Sección | Qué permite |
|---|---|
| **Agenda** | Ver las clases programadas |
| **Materias** | Entrar a cada materia y grupo: clases, actividades, recursos, foro y asistente con IA |
| **Actividades por calificar** | Revisar cada entrega y registrar nota de 0.0 a 5.0 y comentario |
| **Informes** | Ver entregas y promedios por grupo y materia, y descargarlos en CSV |
| ⚠️ **Estudiantes asignados, Mensajes** | Datos de ejemplo |

## 5. Estudiante

| Sección | Qué permite |
|---|---|
| **Inicio** | Ver el resumen de su campus |
| **Mi grupo** | Ver su grupo y compañeros |
| **Mis materias** | Consultar clases, actividades, recursos y foro, y usar el asistente con IA |
| **Mis clases** | Ver próximas clases, entrar a la reunión y consultar grabaciones |
| **Diagnóstico** | Presentar la batería diagnóstica |
| **Mis resultados** | Consultar sus resultados |
| **Tutor con IA** | Resolver dudas de estudio con pistas y explicaciones paso a paso |
| ⚠️ **Mi ruta, Mis cursos, Banco de preguntas, Simulacros, Progreso** | Datos de ejemplo |

### Prueba gratuita Saber 11

Las cuentas creadas desde una postulación solo ven la prueba hasta terminarla, y
después solo su informe.

- Son 5 materias, en un orden propio para cada estudiante. Cada materia se envía una sola vez.
- No hay límite de tiempo. Un cronómetro mide cuánto tarda en cada pregunta.
- El avance se guarda en el navegador por si recarga la página.
- Salir de la pestaña y copiar, cortar o pegar queda registrado.
- Una caída de internet también se registra, pero no cuenta en su contra.
- Al terminar ve su informe y lo recibe en PDF por correo.

## 6. Acudiente

| Sección | Qué permite |
|---|---|
| **Resumen** | Ver el estado general |
| **Mi grupo** | Crear y vincular estudiantes y consultar su grupo |
| ⚠️ **Progreso, Reportes, Pagos, Mensajes** | Datos de ejemplo |

## 7. Colegio

| Sección | Qué permite |
|---|---|
| **Resumen institucional** | Ver indicadores del colegio |
| **Estudiantes** | Crear estudiantes e invitar acudientes |
| **Grupos** | Crear subgrupos y asignar estudiantes |
| ⚠️ **Resultados, Simulacros, Informes** | Datos de ejemplo |

El plan institucional define el **cupo de estudiantes** y si se permiten subgrupos
e invitaciones a acudientes. La base de datos hace cumplir el cupo.

## 8. Flujos principales

### Compra de un plan

```text
/planes-precios → /checkout/[plan] → se registra un pago "pendiente"
      → Wompi cobra → webhook firmado → se valida el valor pagado
      → se crea la cuenta (o se usa la existente) → datos de acceso por correo
      → se activa la suscripción → recibo por correo
```

El acceso se concede con la confirmación firmada de Wompi, nunca con la página de
regreso del navegador.

### Prueba gratuita

```text
Popup → postulación guardada → correo de confirmación → aviso a soporte
      → admin pulsa Notificar → cuenta + contraseña por correo
      → 5 materias → informe en pantalla y PDF por correo
```

### Correos automáticos

| Correo | Se envía cuando |
|---|---|
| Confirmación de postulación | Alguien se postula a la prueba |
| Acceso a la prueba | El admin notifica al postulante |
| Informe de la prueba | El estudiante termina la última materia |
| Resultado del diagnóstico | Se envía un diagnóstico |
| Datos de acceso | Wompi confirma el pago de un comprador nuevo |
| Recibo de pago | Wompi confirma el pago |
| Aviso a soporte | Hay un registro nuevo en el sitio |
| Recordatorio de clase | Faltan 24 horas o 1 hora para la clase |

## 9. Funcionamiento técnico

### Componentes

| Capa | Tecnología | Uso |
|---|---|---|
| Aplicación | Next.js 16, React 19, TypeScript | Sitio y paneles |
| Interfaz | Tailwind CSS 4, shadcn/ui | Componentes visuales |
| Datos y acceso | Supabase (PostgreSQL y Auth) | Base de datos, sesiones y permisos |
| Pagos | Wompi | Cobro en pesos colombianos |
| Correo | Resend | Correos transaccionales |
| IA | Google Gemini | Álex, análisis del diagnóstico, tutor con IA y asistentes de materia |

### Estructura del código

| Carpeta | Contenido |
|---|---|
| `src/app/` | Páginas, acciones de servidor y rutas API |
| `src/features/` | Componentes de cada funcionalidad |
| `src/components/` | Componentes compartidos |
| `src/lib/` | Lógica, consultas, correo, validaciones y datos |
| `supabase/migrations/` | Cambios de la base de datos, numerados |
| `docs/` | Documentación del proyecto |

### Seguridad

- **Roles.** Cada panel exige su rol en el servidor con `requireRole`.
- **Base de datos.** Row Level Security limita qué filas ve cada usuario.
- **Clave `service_role`.** Se salta esos permisos, así que solo se usa en el servidor.
- **Webhook de pagos.** Se valida la firma de Wompi antes de procesarlo.
- **Tareas programadas.** Exigen `CRON_SECRET`.
- **Checkout, contacto, postulación, diagnóstico y chats.** Tienen límite de envíos.
- **Encabezados de seguridad.** Se definen en `next.config.ts`.

### Variables de entorno

Nunca se suben al repositorio. Las que empiezan por `NEXT_PUBLIC_` son visibles en
el navegador y no deben contener secretos.

| Variable | Uso | ¿Secreta? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Dirección del proyecto Supabase | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Acceso total a la base de datos | **Sí** |
| `RESEND_API_KEY` | Envío de correos | **Sí** |
| `RESEND_FROM_EMAIL` | Remitente de los correos | No |
| `CONTACT_EMAIL_TO` | Buzón de soporte | No |
| `CRON_SECRET` | Protege las tareas programadas | **Sí** |
| `GEMINI_API_KEY` | Acceso a la IA | **Sí** |
| `GEMINI_MODEL` | Modelo de IA | No |
| `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` | Clave pública de Wompi | No |
| `WOMPI_INTEGRITY_SECRET` | Firma de los pagos | **Sí** |
| `WOMPI_EVENTS_SECRET` | Verificación del webhook | **Sí** |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp del sitio | No |
| `NEXT_PUBLIC_SITE_URL` | Dominio del sitio | No |

### Cambios en la base de datos

Las migraciones se aplican a mano, en orden numérico, desde el **SQL Editor** de
Supabase. Aplica siempre la migración **antes** de desplegar el código que la usa.

### Desarrollo local

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

`.env.local` debe contener las variables anteriores. Evita apuntar el entorno local
a la base de datos de producción cuando pruebes cambios que escriben datos.

## 10. Solución de problemas

| Problema | Qué revisar |
|---|---|
| "Tu cuenta no tiene un rol asignado" | Que exista la fila del usuario en `profiles` |
| No llegan correos | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` y la cuota de Resend |
| El pago no activa el plan | Webhook de Wompi y `WOMPI_EVENTS_SECRET` |
| "Firma inválida" en Wompi | Espacios sobrantes en `WOMPI_INTEGRITY_SECRET` |
| Álex no responde | `GEMINI_API_KEY`, `GEMINI_MODEL` y la sección IA (Álex) |
| Error al guardar tras un despliegue | Que todas las migraciones estén aplicadas |
| El sitio no carga datos | Si el proyecto de Supabase quedó pausado por inactividad |
| No llegan recordatorios | [Guía de recordatorios](recordatorios-clases.md#operación) |
