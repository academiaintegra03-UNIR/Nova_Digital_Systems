# Roadmap de funcionalidades — Nova Digital Systems

Este documento reúne las funcionalidades planeadas que todavía no están
construidas, organizadas por área, con la tecnología recomendada para cada
una y el porqué. Complementa el `README.md` de la raíz (que documenta lo que
ya existe hoy) — este archivo es sobre lo que falta.

Criterio general para elegir tecnología en todo el roadmap: **bajo costo,
compatible con cuenta de Google personal, y de ser posible reutilizar la
pila que ya tenemos** (Next.js + Supabase + Vercel) en vez de sumar
proveedores nuevos.

## Contexto — junta del 11 de agosto de 2026

Reunión virtual con Jimmy Alejandro R. M. (director) y Yuliana Park
Cobaleda, sobre carga horaria, análisis de plataformas educativas
internacionales y definición técnica del proyecto. **En la fecha de la
reunión todavía no había nada construido ni planeado en detalle** — los 4
próximos pasos que salieron de ahí eran justamente para empezar a
planear. Lo que aparece más abajo como "ya construido" se hizo **después**
de la junta, como un avance real adelantado a lo que se pidió (que era
solo planear) — no algo que ya existiera o se hubiera acordado en la
reunión misma. Este documento responde a los 4 próximos pasos, aclarando
esa diferencia entre lo planeado y lo efectivamente avanzado:

1. **Llenar formulario semanal** — ver [resumen para el formulario](#resumen-para-el-formulario-semanal) al final de esta sección.
2. **Planear la plataforma del estudiante** — ver [plan detallado de funcionalidades](#plan-detallado--plataforma-del-estudiante).
3. **Evaluar tecnologías de bajo costo compatibles con cuenta de Google personal** — ver la sección [Costos](#costos-capa-gratuita-de-cada-servicio-y-qué-pagar-si-se-supera) más abajo; la pila ya elegida y en uso cumple este criterio.
4. **Generar cronograma semanal hasta finales de octubre** — ver [cronograma propuesto](#cronograma-propuesto-mediados-de-agosto--finales-de-octubre).

### Plan detallado — plataforma del estudiante

**Avance ya realizado** (después de la junta, no algo que ya existiera al
momento de la reunión — autenticación real con Supabase, no simulada):

- **Estudiante** (`/campus`): mi ruta de aprendizaje, mis cursos, banco de
  preguntas, simulacros, progreso (gráficos y porcentajes — la misma
  funcionalidad que se identificó en las plataformas internacionales de
  Chile/México/Brasil analizadas por Yuliana), tutor con IA.
- **Acudiente** (`/acudientes`): progreso de su(s) estudiante(s), reportes,
  pagos, mensajes — con relación acudiente↔estudiante (varios hijos por
  acudiente si aplica).
- **Colegio** (`/colegios-panel`): datos agregados de todos sus
  estudiantes, resultados, simulacros institucionales — con cupo de
  estudiantes controlado por el plan contratado (pensado para el caso de
  prueba de 25 estudiantes que se planteó en la junta).
- **Administrador**: gestión de usuarios, planes y pagos, y métricas del
  chatbot de IA.
- Chatbot de orientación con IA (Álex), inscripción y pago integrados
  (Wompi) con planes individuales, grupales/familiares e institucionales.

**Pendiente** (detallado en [Funcionalidades planeadas](#funcionalidades-planeadas)
más abajo): contenido real de cursos y banco de preguntas (hoy es data de
ejemplo), foros, chat en vivo, carga de documentos y video, programación de
clases, y la automatización de reportes quincenales por WhatsApp/correo que
se pidió en la junta.

### Cronograma propuesto (mediados de agosto → finales de octubre)

A un ritmo de 9–11 horas/semana, como se acordó con Jimmy. Las semanas 1–2
ya se adelantaron por encima de lo pedido en la junta (que era solo
planear) — el resto es la propuesta hacia adelante:

- **Semanas 1–2** (avance ya hecho, adelantado a la planeación pedida):
  autenticación real, roles y paneles base, relaciones
  colegio/acudiente/estudiante con cupos, chatbot Álex, planes y pagos con
  Wompi (en pruebas/sandbox).
- **Semanas 3–4**: cerrar pagos con Wompi en producción; conectar
  contenido real en los paneles (cursos, banco de preguntas, simulacros).
- **Semanas 5–6**: automatización de reportes quincenales por WhatsApp y
  correo para acudientes y colegios.
- **Semanas 7–8**: foros, chat en vivo, carga de documentos; simulación
  completa del caso de 25 estudiantes en un colegio.
- **Semanas 9–10**: pruebas de usuario con familiares y amigos (según el
  objetivo de noviembre planteado en la junta) y ajustes finales.

*(Fechas exactas a ajustar según disponibilidad real — esto es la
propuesta técnica de secuencia, no un compromiso cerrado de horas.)*

### Resumen para el formulario semanal

Texto listo para pegar en el formulario de seguimiento: *"Se implementó
autenticación real (Supabase) con los 5 roles del sistema; se modeló la
relación entre colegios, acudientes y estudiantes con control de cupos por
plan; se conectó el chatbot de orientación con IA (Gemini); se construyó
el módulo de planes (individual, grupal, institucional) con pago real vía
Wompi, incluyendo creación automática de cuenta al pagar; se documentó el
roadmap técnico de las funcionalidades pendientes (foros, chat, carga de
archivos y video, programación de clases) con su costo estimado."*

## Pila ya implementada (contexto)

| Capa | Tecnología | Costo |
|---|---|---|
| Framework web | Next.js (App Router) | Gratis |
| Despliegue | Vercel | Plan gratuito |
| Base de datos + autenticación | Supabase (Postgres + Auth + RLS) | Plan gratuito |
| IA del chatbot de orientación | Google AI Studio / Gemini API | Capa gratuita |
| Pagos | Wompi | Sin costo de integración |

## Costos: capa gratuita de cada servicio y qué pagar si se supera

Cifras verificadas en las páginas oficiales de cada proveedor (agosto 2026).
Donde una cifra viene de una fuente no oficial, queda marcado explícitamente.

### Supabase (base de datos, auth, storage, realtime)

| Recurso | Límite gratis | Si se supera |
|---|---|---|
| Base de datos | 500 MB | — |
| Storage (archivos) | 1 GB | — |
| Egreso/transferencia | 5 GB/mes | — |
| Usuarios activos mensuales (Auth) | 50.000 | — |
| Conexiones Realtime concurrentes | 200 | — |
| Mensajes Realtime | 2 millones/mes | — |
| Edge Functions | 500.000 invocaciones/mes | — |
| Proyectos activos | 2 | — |

**Plan Pro: desde $25 USD/mes** (sube todos los topes de la tabla —
ej. 8 GB de base de datos, 100 GB de Storage, 250 GB de egreso).
⚠️ Un proyecto gratuito **se pausa solo tras 1 semana sin actividad** — hay
que tenerlo presente durante fases de prueba con poco tráfico.

### Vercel (hosting/despliegue)

| Recurso | Límite gratis (Hobby) | Si se supera |
|---|---|---|
| Transferencia de datos | 100 GB/mes | Plan Pro: **$20 USD/usuario/mes** — luego ~$0.15 USD/GB extra |
| Invocaciones de funciones | 1.000.000/mes | Incluidas 10M/mes en Pro, luego ~$0.60 USD/millón |
| Cómputo activo (CPU) | 4 CPU-horas/mes | Incluido más cupo en Pro, luego por uso |
| Duración máx. por función | 300 segundos | Configurable hasta 800s en Pro |
| Miembros de equipo | 1 (sin colaboración) | Incluido en Pro |

⚠️ El plan Hobby es **solo para uso no comercial** — un sitio que vende
matrículas/planes (como este) técnicamente requiere Pro para cumplir los
términos de Vercel, más allá de si se llega a los topes de uso.

### Google Gemini API (chatbot Álex)

| Recurso | Capa gratuita | Si se activa facturación |
|---|---|---|
| Tokens de entrada/salida (modelo Flash) | Gratis | Entrada: **$0.50 USD por millón de tokens**. Salida: **$3.00 USD por millón** (gemini-3-flash-preview) |
| Peticiones por minuto/día | Ya no hay una cifra fija publicada — el cupo real se ve en vivo en [aistudio.google.com/rate-limit](https://aistudio.google.com/rate-limit) | — |

⚠️ Google dejó de publicar un límite fijo de peticiones/minuto para la capa
gratuita — varía por cuenta. Antes de dar una cifra exacta en un reporte,
hay que consultar el dashboard de esa cuenta específica.

### Wompi (pagos)

No tiene "capa gratuita" con tope — cobra comisión desde la primera venta,
sin mensualidad:

| Método | Comisión |
|---|---|
| Tarjetas, PSE, Nequi, transferencia Bancolombia (plan estándar) | **2.65% + $700 COP + IVA** por transacción aprobada |
| Pago con código QR | **1%** por transacción aprobada |
| 2.000+ transacciones/mes (plan Gateway) | Sin comisión de Wompi — solo la tarifa que negocie el comercio con el banco |

### YouTube (video)

Sin límite práctico y sin costo, tanto para subir como para embeber video
— no aplica capa "gratis vs. paga" en este caso.

### Google Meet (programación de clases)

| Recurso | Cuenta personal (gratis) |
|---|---|
| Participantes | Hasta 100 |
| Llamada 1 a 1 | Sin límite de tiempo |
| Llamada grupal (3+) | Tope de **60 minutos** |

*(Cifra de duración de reunión grupal tomada de fuentes de seguimiento de
producto, no de una página oficial de soporte de Google — conviene
confirmarla en el momento de implementar.)* Si se necesita sin límite de
tiempo en llamadas grupales, la alternativa es Google Workspace de pago
(ver workspace.google.com/pricing).

⚠️ **Esto no aplica en este caso**: la cuenta de Google que se usa para
las clases tiene **Google One Pro** (nivel Premium, 2 TB), que incluye
las funciones Premium de Meet — entre ellas, llamadas grupales sin el
tope de 60 minutos y grabación de la reunión. En la práctica el tope de
la tabla de arriba no aplica y no hace falta Google Workspace para esto.
*(Beneficio de Meet según el comparativo de planes de Google One, no
verificado en vivo contra el dashboard de esa cuenta específica —
confirmar ahí los beneficios exactos del plan antes de depender de esto
para una clase real, sobre todo la grabación.)*

### Dominio propio

No es un servicio con capa gratis — es una compra anual recurrente.
Cifras aproximadas de mercado (Namecheap), a confirmar al momento de comprar:

| Dominio | Primer año | Renovación |
|---|---|---|
| `.com` | ~$7–10 USD (con promoción) | ~$14–18 USD/año |
| `.co` | ~$25–32 USD | ~$25–32 USD/año |

### Resend (correo de reportes)

| Recurso | Capa gratuita | Si se supera |
|---|---|---|
| Correos por día | 100 | — |
| Correos por mes | 3.000 | Plan de pago: **$20 USD/mes** (50.000 correos/mes) o **$35 USD/mes** (100.000/mes), luego $0.90 USD por cada 1.000 correos extra |
| Dominios verificados | 1 | 10 incluidos en los planes de pago |

⚠️ La capa gratuita **exige tener el dominio propio verificado igual que
la de pago** — no hay forma de mandar ni un correo de prueba sin dominio.

### WhatsApp Business Platform (reportes)

Sin capa gratuita mensual ni suscripción fija de Meta — se cobra por
mensaje de plantilla entregado fuera de una conversación abierta, desde el
primer envío:

| Categoría de mensaje | Costo aproximado (Colombia) |
|---|---|
| Utilidad (ej. un reporte quincenal automático) | **~$0.0008 USD por mensaje** |
| Autenticación | **~$0.0008 USD por mensaje** |
| Marketing | **~$0.014 USD por mensaje** |

A esto se suma **la tarifa propia del proveedor autorizado (BSP)** elegido
para conectar la API (Twilio, 360dialog, Infobip, etc.) — varía por
proveedor, hay que cotizarla aparte. No incluye ningún costo por usar un
tercero no oficial, precisamente porque **no se recomienda usarlo**: el
riesgo es perder el número de WhatsApp del negocio.

*(Cifras de Meta tomadas de rastreadores de precios de 2026, no del
tablero de tarifas oficial descargable — Meta también tiene cambios de
tarifas programados para el 1 de agosto y el 1 de octubre de 2026, así que
hay que confirmar el número exacto en WhatsApp Manager antes de cerrar un
presupuesto.)*

## Funcionalidades planeadas

### 1. Carga de documentos

- **Tecnología**: Supabase Storage (mismo proyecto, mismas políticas de
  seguridad por rol — RLS — que ya usa la base de datos).
- **Casos de uso**: foto de perfil, material de estudio (PDFs), entregas de
  actividades de estudiantes.
- **Por qué esta y no otra**: cero proveedores nuevos, gratis dentro del
  1 GB de Storage del plan gratuito.

### 2. Carga y hospedaje de video

- **Tecnología recomendada**: YouTube en modo "no listado", embebido en la
  plataforma.
- **Por qué no Supabase Storage**: no está pensado para streaming de video
  (sin transcodificación ni bitrate adaptativo), y el ancho de banda de
  video agota el egreso gratuito (5 GB/mes) muy rápido.
- **Alternativa de pago, solo si se necesita más control** (privacidad
  estricta, sin marca de YouTube): Cloudflare Stream o Mux — precio por uso,
  pero suman un proveedor nuevo.

### 3. Dominio propio [LISTO]

- El sitio ya tiene dominio propio: `soberanocognitivo.com`. `NEXT_PUBLIC_SITE_URL`
  quedó actualizado en `.env.local` y todo el metadata/JSON-LD (`lib/seo.ts`)
  se arma a partir de esa variable.
- **Pendiente de tu parte**: conectar el dominio en Vercel → Settings →
  Domains (si no está ya) y agregar la misma variable `NEXT_PUBLIC_SITE_URL`
  en Vercel → Settings → Environment Variables, para que aplique en producción.
- Esto además desbloquea el envío de correo real (punto 7, reportes
  automáticos), que **exige** un dominio propio verificado.
  Sin dominio, no se puede activar esa funcionalidad en absoluto.

### 4. Programación de clases

- **Tecnología recomendada**: Google Calendar + Google Meet.
- **Cómo funcionaría**: el tutor programa la sesión, se genera el link de
  Meet automáticamente; en nuestra base de datos solo se guarda la
  referencia (fecha, tutor, estudiante, link a la reunión).
- **Por qué esta y no una videollamada propia**: construir infraestructura
  de videollamadas en vivo es caro y complejo; Google ya lo resuelve gratis
  con una cuenta personal.

### 5. Chats

- **Tecnología**: Supabase Realtime (suscripciones en vivo sobre tablas de
  Postgres) — mismo proveedor, mismas políticas de seguridad, sin costo
  extra en el plan gratuito.
- **Dónde encaja**: las páginas de "Mensajes" que ya existen en los
  paneles de acudientes y tutores (hoy son simuladas, sin backend real).
- **Modelo de datos**: tabla `messages` (o similar) con RLS por
  conversación, consumida en tiempo real desde el cliente.

### 6. Foros

- **Tecnología**: tablas normales de Postgres (posts + respuestas), CRUD
  estándar — mismo patrón ya usado en `/admin/planes` y `/admin/usuarios`.
- **Realtime es opcional acá**: a diferencia del chat, un foro no necesita
  tiempo real estricto; se puede sumar después si se quiere que se sienta
  "vivo" sin que sea un requisito de la primera versión.

### 7. Envío de correos (reportes automáticos)

- **Tecnología recomendada**: [Resend](https://resend.com) — API simple de
  envío transaccional, se integra directo desde una Route Handler de
  Next.js, sin servidor SMTP propio que mantener.
- **Casos de uso**: los reportes quincenales por correo para acudientes y
  colegios que se pidieron en la junta, confirmaciones de pago, y
  recuperación de contraseña (Supabase Auth también puede necesitar esto
  más adelante).
- ⚠️ **Bloqueante real**: Resend **exige un dominio propio verificado**
  (registros DNS) antes de poder enviar un solo correo — no existe un
  remitente compartido de prueba, ni siquiera para pruebas. No se puede
  avanzar en esta funcionalidad hasta tener el dominio del punto 3.

### 8. Reportes por WhatsApp

- **Tecnología recomendada**: la **API oficial de WhatsApp Business
  Platform (Cloud API) de Meta**, integrada a través de un proveedor
  autorizado (BSP) como Twilio, 360dialog o Infobip.
- **Por qué NO un tercero no oficial**: herramientas que automatizan
  WhatsApp simulando la app de consumo (estilo whatsapp-web.js) no usan la
  API real de Meta, violan sus términos de servicio, y arriesgan que **se
  bloquee el número** — inaceptable para algo que le llega a acudientes y
  colegios de forma recurrente. Un BSP oficial sí usa la API real de Meta
  (con su propio cobro adicional por encima del de Meta), y mantiene la
  cuenta segura y en regla.
- **Tiene costo, sin capa gratuita mensual** — ver el detalle en
  [Costos](#whatsapp-business-platform-reportes) más abajo.

## Resumen — qué suma proveedor nuevo y qué no

| Funcionalidad | Proveedor nuevo? |
|---|---|
| Carga de documentos | No (Supabase) |
| Carga de video | No (YouTube, gratis) |
| Dominio propio | Sí (registrador de dominios — es una compra, no un servicio recurrente de código) |
| Reportes por WhatsApp | Sí (API oficial de Meta + un BSP) — tiene costo desde el primer mensaje |
| Programación de clases | No (Google, cuenta personal ya existente) |
| Chats | No (Supabase) |
| Foros | No (Supabase) |
| Envío de correos | Sí (Resend) — y depende del dominio propio |

La mayoría del roadmap cabe dentro de la pila ya adoptada (Next.js +
Supabase + Vercel + Google), sin sumar proveedores nuevos. Las dos
excepciones reales son el **dominio propio** (compra única/anual,
necesaria además para poder mandar correo) y los **reportes por
WhatsApp** (API oficial de Meta + BSP, con costo desde el primer mensaje
— justificado porque es la única forma segura de no arriesgar el número
del negocio). Esto sigue siendo coherente con el objetivo de plataforma
funcional y de bajo costo planteado en la reunión con Jimmy Alejandro
R. M. del 11 de agosto de 2026 — el costo es bajo y predecible, no cero.
