# Masajes Aurora

Web de masajes a domicilio en Ávila capital, con Melba como profesional. Nuxt sirve la web, API y panel privado desde Cloudflare Workers; D1 conserva reservas y tarifas; Stripe procesa el pago conjunto; un segundo Worker consume Cloudflare Queues y envía emails mediante Resend.

## Estado inicial

Staging usa pago **solo en efectivo**, con tarifas de **40 € por 40 minutos** y **50 € por 60 minutos**. Las jornadas iniciales son de lunes a domingo, 09:00–21:00 (Europe/Madrid). El acceso privado solo autoriza a **masajesaurora@gmail.com**. El teléfono sigue siendo +34 644 798 063.

Se conserva .env.local y sus valores anteriores; únicamente se ha añadido ADMIN_EMAIL. .env.example enumera las nuevas variables. No publiques .env.local ni .data: contienen secretos, enlaces privados o mensajes locales.

## Desarrollo local

Necesitas Node 22.22.3+, 24.15+ o 26+, y npm.

```powershell
npm ci
npm run dev
```

Abre http://localhost:3000. El adaptador de desarrollo usa D1 local persistente en .data/d1. Los emails se escriben en **.data/mail.jsonl** y nunca se envían realmente. Para entrar, visita /admin/acceso, solicita el enlace al email autorizado, abre el enlace guardado en ese archivo y pulsa Entrar. Los enlaces duran 15 minutos y se usan una sola vez; la sesión dura ocho horas.

Para pruebas locales, SITE_URL debe ser http://localhost:3000. Puedes configurar EMAIL_FROM=reservas@localhost exclusivamente en el entorno local; para Workers necesitas un remitente verificado. La variable anterior VITE_ANIMATED_MARBLE sigue funcionando; ANIMATED_MARBLE tiene prioridad.

El panel permite definir precios y jornadas, abrir/cerrar reservas, bloquear periodos, añadir citas de WhatsApp, cancelar citas confirmadas, marcar sesiones realizadas y registrar cobros en efectivo. La agenda abre en una semana de lunes a domingo, con flechas para cambiar de periodo, selector Semana/Día y recuento diario de masajes. Al seleccionar una reserva, el detalle aparece a la derecha en escritorio o en un diálogo en móvil e incluye el email del cliente con enlace mailto. Una cita pagada cancelada conserva el estado del pago hasta tramitar su devolución en Stripe. No hay reprogramación automática.

El enlace discreto Historial de reservas, al pie de la agenda, sustituye la pestaña Reservas. Permite filtrar por fechas y estado, incluidas canceladas y caducadas, sin ocupar espacio en el calendario. Volver a la agenda recupera el periodo semanal o diario seleccionado.

```powershell
npm run db:local
npm run type-check
npm test
npm run build:cloudflare
npm run test:worker
npm run preview
```

build:cloudflare crea y valida dos Workers bajo .cloudflare/output/v0. preview ejecuta el bundle real en workerd en http://localhost:8888, con una DB aislada y reservas, pagos y emails deshabilitados. test:worker verifica SSR, rutas públicas, API, imágenes, autenticación y el límite de tamaño del cuerpo con DB efímera. El desarrollo habitual usa npm run dev.

## Reglas de reserva

Una reserva agrupa masajes de 40/60 minutos, realizados consecutivamente en una sola dirección y con un único pago. **No hay cupo diario**: se pueden reservar las sesiones que quepan en las jornadas, respetando la separación entre visitas. Se suman cantidades, precios y duraciones sin descuentos; se conservan instantáneas de lo contratado.

La jornada ofrece inicios cada diez minutos. Toda la visita debe caber y dejar 30 minutos entre reservas. No se añade pausa dentro del grupo. El servidor exige tres horas de antelación y permite reservar hasta 30 días vista; usa Europe/Madrid y distingue los instantes de los cambios de hora. El desplegable muestra únicamente las horas disponibles y la hora de fin de la sesión, sin datos personales.

Se comprobaron capturas locales del desplegable a 1440px y 390px con cuatro masajes de 60 minutos, catálogo real de staging y disponibilidad calculada con la lógica compartida sobre una agenda vacía de prueba; no se enviaron reservas. Pasan 42 tests y type-check, incluidas conservación de una reserva al migrar, cuatro masajes en una sesión y cuatro masajes entre reservas sin solapamiento, manteniendo separación y antelación. Tras desplegar, test:worker pasó SSR, API, assets, autenticación privada y límite de cuerpo. Chrome sobre staging real, sin fixtures, a 1440px y 390px confirmó cuatro masajes de 60 minutos, API 200 con 240 minutos y 49 horas disponibles (primera 09:00–13:00), sin indicador de cupo restante, desbordamiento horizontal ni errores de página. No se enviaron reservas ni emails.

Los triggers de D1 reservan franjas y evitan solapamientos de forma atómica, incluyendo bloqueos temporales de pago y sesiones realizadas. Las cantidades e importes se validan y calculan en el servidor; el cliente no puede enviar un precio.

El efectivo confirma inmediatamente, con cobro pendiente y sin verificar email. El pago online crea un Checkout para toda la visita y bloquea el horario hasta 30 minutos, limitado por el corte de antelación. Un cron cada minuto reconcilia abandonos y despacha notificaciones. Antes de liberar se recupera/cierra Checkout y se verifica su estado. Si Stripe está inaccesible, se conserva el bloqueo para evitar sobreventa hasta poder cerrar el pago; este fallo debe generar una alerta operativa.

Se usa el instante del evento de Stripe, no la hora de recepción del webhook, para respetar pagos a tiempo recibidos con retraso. Los cobros fuera de plazo se reembolsan con idempotencia. Solo se admiten tarjetas y sus monederos Apple Pay/Google Pay en una configuración de métodos dedicada. El servidor comprueba la configuración; desactiva Link, adeudos, transferencias y cualquier otro método en esta versión.

## Preparar staging en Cloudflare

Se usa **cf CLI**, fijado en package-lock.json. No se necesita Netlify ni una configuración Wrangler. Antes de operar, confirma la cuenta autenticada; configura un perfil de cf o CLOUDFLARE_ACCOUNT_ID y las credenciales de Cloudflare en el entorno/CI. La CLI permite descubrir comandos sin incluir datos identificativos en la búsqueda:

```powershell
npm exec -- cf cli search "create D1 database"
npm exec -- cf d1 create --name masajes-aurora-staging --primary-location-hint weur
npm exec -- cf cli search "create queue"
npm exec -- cf queues create --queue-name masajes-aurora-notifications-staging
npm exec -- cf d1 migrations apply DATABASE_ID --dir migrations
```

Sustituye DATABASE_ID por el UUID devuelto. Se crea una DB independiente; no apliques estas migraciones a otra aplicación. cf mantiene el registro d1_migrations y aplica los cambios pendientes por orden.

Completa .env.local o las variables de CI:

- SITE_URL: origen HTTPS real de staging, sin barra final; debe coincidir con el dominio servido para validar Origin.
- D1_DATABASE_ID y NOTIFICATIONS_QUEUE: recursos de staging recién creados.
- ADMIN_EMAIL: masajesaurora@gmail.com.
- EMAIL_FROM: remitente verificado en Resend. Staging reutiliza `Masajes Aurora <reports.staging@orders.geonuvia.com>` de la configuración de Geonuvia.
- RESEND_API_KEY: clave de envío de Resend, solo del servidor; se carga como secreto exclusivamente en el Worker de emails. Las respuestas se dirigen a ADMIN_EMAIL.
- WORKER_DOMAIN: hostname propio opcional, en una zona de la cuenta; cf configura el dominio del Worker. Si usas workers.dev, deja esta variable vacía y ajusta SITE_URL al hostname real.
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET y STRIPE_PAYMENT_CONFIGURATION: las tres variables, o ninguna para probar solamente efectivo. Staging exige una clave sk_test_/rk_test_; producción exige sk_live_/rk_live_.

El remitente debe pertenecer a un dominio verificado en Resend. La integración usa su API HTTPS desde el Worker de notificaciones; no requiere Cloudflare Email Service. La DB y la cola de Aurora staging son independientes de Geonuvia.

```powershell
npm run deploy
```

El script valida el destino, compila ambos Workers y despliega primero masajes-aurora-email-staging y después masajes-aurora-staging con cf deploy --prebuilt. Sube RESEND_API_KEY exclusivamente al Worker de emails y, cuando se habiliten pagos online, las dos claves privadas de Stripe al Worker web. Usa archivos temporales restringidos que borra al terminar; nunca sube .env.local completo. Si falta configuración, termina antes de desplegar.

Para revisar el paquete sin publicar:

```powershell
npm exec -- cf deploy --prebuilt --dry-run --mode staging
npm exec -- cf deploy --prebuilt --dry-run --mode staging --worker masajes-aurora-email-staging
```

### Configuración actual de staging

- Desplegado y reservas abiertas el 11/10/2026. URL: https://aurora-staging.geonuvia.com
- D1: masajes-aurora-staging; cola: masajes-aurora-notifications-staging.
- Tarifas: 40 minutos, 40 €; 60 minutos, 50 €. Lunes a domingo, 09:00–21:00.
- Pago en efectivo; las tres variables Stripe permanecen vacías.
- Emails mediante Resend con el remitente de staging de Geonuvia y nombre Masajes Aurora. Acceso privado para masajesaurora@gmail.com.

Se verificaron HTTP 200 en web, reserva, acceso e imágenes, catálogo con tarifas y efectivo, disponibilidad de grupos mixtos y HTTP 401 en la API privada. La URL inicial workers.dev agotaba el tiempo de conexión con la resolución DNS local. Staging se publica temporalmente en aurora-staging.geonuvia.com, actualizando SITE_URL y WORKER_DOMAIN. Se verificó en Chrome con conexión normal: página renderizada, imágenes y JavaScript sin errores, navegación a reservas y canonical con el nuevo origen. Pasan 42 tests, type-check y test:worker.

Las pruebas manuales de reserva, recepción real de emails y panel quedan a cargo del propietario. Stripe y dominio definitivo se configuran posteriormente. No se ha enviado un email real como parte del despliegue.

La migración usa SELECT RAISE(...) WHERE dentro de los triggers y finales LF para evitar los problemas del analizador SQL remoto con CASE/END. Se mantienen las mismas condiciones de antelación, capacidad, solapamiento y bloqueos; las migraciones quedan registradas en d1_migrations.

## Stripe y pruebas completas

Crea una configuración de métodos **de pruebas** exclusiva para tarjetas y monederos; copia su ID pmc_ en STRIPE_PAYMENT_CONFIGURATION. Una clave restringida necesita lectura/escritura de Checkout, lectura de Events y Payment Method Configurations, y permiso para crear Refunds. Configura un webhook HTTPS en SITE_URL/api/stripe/webhook con eventos checkout.session.completed, checkout.session.expired, checkout.session.async_payment_succeeded y charge.refunded. Conserva su secreto whsec_ en el servidor; no se confirma una cita desde la página de retorno.

Primero prueba una reserva en efectivo y otra con una tarjeta de pruebas de Stripe. Comprueba el grupo mixto, jornadas y separación entre visitas, el resumen, ambos emails reales, el enlace privado y el panel. Abandona un Checkout y verifica cierre/liberación; reenvía un webhook y comprueba que no duplica avisos. Verifica también una devolución desde el Dashboard y un fallo recuperable de email. No uses tarjetas reales en staging.

Hay pruebas con D1 real simulado para concurrencia y solapamientos, tarifas conservadas, buffers, jornadas, antelación, horario de verano/invierno, caducidad, webhooks repetidos/tardíos, importes manipulados, firma inválida, reembolsos y reintentos de email. La agenda privada se revisó en Chrome local a 1440×1000 y 390×844, con veredicto ship del revisor. El historial vacío recibió veredicto ship a esos tamaños; la revisión no incluyó registros poblados ni estados transitorios. También se comprobaron filtros, rechazo HTTP 400 de consultas inválidas, vuelta a la agenda y ausencia de desbordamiento móvil. La revisión visual de la página pública sigue pendiente. La revisión de código conserva el sistema visual existente. Los tests de Stripe usan un cliente simulado: la prueba completa con Checkout y entrega real exige las credenciales y recursos anteriores.

## Emails, privacidad y observabilidad

Las notificaciones se insertan en outbox en la misma operación que la reserva/confirmación. La cola solo transporta el ID; el Worker de emails obtiene una concesión temporal, entrega y guarda el identificador del proveedor. Los fallos se reintentan; el cron vuelve a encolar los avisos pendientes aunque se agoten los reintentos de un mensaje. El panel muestra intentos/errores y permite reintentar. Un fallo de email no anula una cita.

La entrega es al menos una vez. Se envía una Idempotency-Key estable por aviso: Resend deduplica durante 24 horas. Si el proveedor acepta el email y el Worker cae antes de guardar sent_at, un reintento posterior a esa ventana puede repetir el email. Los reintentos ordinarios y webhooks duplicados no crean nuevos avisos lógicos.

Los enlaces privados son credenciales: se generan con 256 bits aleatorios, se consultan por hash y se envían por email. Los enlaces completos también viven en las reservas y avisos de D1; protege el acceso a la DB como acceso a datos privados. Las rutas privadas llevan no-store, noindex y no-referrer. Cookies del panel HttpOnly, SameSite=Strict y Secure en HTTPS. Las escrituras comprueban Origin y hay límites de solicitudes por IP. Las notas se escapan al construir HTML del email; no incluyas información médica innecesaria.

Observabilidad de Workers y muestreo de trazas están configurados. Los logs propios no incluyen contacto, dirección, notas ni secretos; informan IDs y códigos de error. Cloudflare puede registrar la URL de invocación: restringe el acceso y la retención de logs, especialmente porque las rutas privadas contienen tokens. Configura alertas de reconciliation_failed, EMAIL_SEND_FAILED, avisos pendientes antiguos, errores de cron y fallos de webhook. La política de conservación de datos personales y textos legales del negocio debe definirse antes de producción.

npm audit señala avisos transitivos de braces (patrones de glob) y node-forge (tooling de certificados), que se propagan como once avisos altos en la cadena de herramientas de Nuxt. No tienen una versión corregida compatible en este lockfile. simple-git y shell-quote se han actualizado mediante overrides. No se fuerza la bajada de Nuxt que propone audit; revisa las actualizaciones de esas dependencias antes de activar producción. El bundle Worker verificado no incluye el tooling de glob/certificados.

## Activación de producción

Usa otra DB, otra queue, el dominio definitivo, un remitente verificado y claves Stripe live. Aplica las migraciones, configura precios y confirma los controles de staging. Después establece DEPLOY_PRODUCTION=true y ejecuta npm run deploy -- --production. La activación de reservas se hace desde el panel. Cambiar el entorno no migra reservas de staging a producción; nunca copies datos de pruebas a la agenda real.

El intervalo, antelación y horizonte están en shared/booking.ts. migrations/0002_remove_daily_capacity.sql elimina el cupo diario conservando reservas existentes, separación y antelación; está aplicada en staging y la actualización está desplegada y verificada (versión 2ecaa187-bf92-49db-88c8-afcd68161da7). Cambiar estas reglas requiere una migración nueva coherente con la API y las pruebas.

## Acceso privado de staging

Toda la web y el panel en https://aurora-staging.geonuvia.com usan Cloudflare Access con el proveedor OTP de Geonuvia y el único correo albertoesquivelanias@gmail.com. La sesión dura 24 horas. El código lo envía Cloudflare; Resend sigue enviando las notificaciones de reservas a Melba y a los clientes. ADMIN_EMAIL conserva masajesaurora@gmail.com para los avisos.

El panel acepta la identidad firmada de Access sin pedir otro enlace. Los endpoints de enlace antiguo se deshabilitan cuando Access está configurado. Salir cierra la sesión de Access. workers.dev y las URL de preview están deshabilitados; el Worker verifica firma RS256, emisor, audiencia, caducidad y email antes de servir web, API o imágenes. Configuración pública en config/access.json; npm run setup:access crea/verifica solo la aplicación y política de Aurora, sin modificar Geonuvia. Cada despliegue staging comprueba esa configuración.

El desarrollo y preview locales mantienen el acceso anterior por enlace, con bypass del perímetro limitado a loopback explícitamente configurado. No se envían códigos OTP en las pruebas automatizadas. Stripe sigue deshabilitado; antes de activar pagos, habrá que configurar el acceso del webhook firmado, porque actualmente todo el dominio está protegido.

Verificación del despliegue Access (versión 17c36748-5fb1-472a-b6ef-57fd694377fc): 62 tests, type-check y test:worker pasan. Sin sesión, /, /reservar, /admin, /admin/acceso y /api/admin/settings responden 302 hacia geonuvia.cloudflareaccess.com. Chrome muestra el formulario Email / Send login code para Masajes Aurora staging. No se solicitó un OTP ni se completó una sesión real de propietario; esa última comprobación requiere el código del correo autorizado. El despliegue incluye los cambios locales de logo y formulario.

## Turnstile en reservas web

POST /api/bookings exige turnstileToken. El widget Managed aparece al revisar la reserva; el botón de confirmación permanece deshabilitado hasta verificar. Los tokens se renuevan al caducar, editar o fallar el envío, manteniendo datos y requestKey en los reintentos. El panel no requiere Turnstile y mantiene Access.

El servidor comprueba los datos y después Siteverify (timeout de 10 segundos), success, action=booking_create y hostname exacto de SITE_URL. Solo después ejecuta reconciliación, creación de reserva, Checkout y avisos. Las solicitudes inválidas se rechazan con 403 y los fallos del servicio con 503; no se crean citas ni avisos. No se registran tokens ni secretos.

TURNSTILE_SITE_KEY se publica en Nuxt; TURNSTILE_SECRET_KEY se guarda en .env.local ignorado y se sube únicamente como secreto del Worker web. npm run setup:turnstile crea o verifica el widget staging autorizado para aurora-staging.geonuvia.com, localhost y 127.0.0.1 mediante cf CLI. Cada backend solo acepta su propio hostname, nunca una lista conjunta de dominios locales y staging. El dominio definitivo requiere su configuración antes de producción.

Verificación: 74 tests y type-check pasan; Siteverify real rechazó el token de prueba y validó el secreto sin imprimirlo. Chrome local a 1440px y 390px, con APIs/widget simulados, comprobó botón, caducidad, errores, reintento y requestKey conservado sin crear reservas. El script y el frame reales de Turnstile se comprobaron en 127.0.0.1 a 390px, sin desbordamiento y sin enviar la reserva. La prueba final con un usuario autenticado en staging y un token real enviado a la API requiere una reserva manual; no se ejecutó.

Turnstile desplegado en staging: versión 9878a4db-e2d8-4ffe-b2dc-bc22b928e950. test:worker pasa. Se confirmó que el secreto solo está vinculado al Worker web y que /reservar y /admin siguen redirigiendo a Access sin sesión. Para pruebas locales reales, SITE_URL debe coincidir con el hostname utilizado (localhost o 127.0.0.1).
