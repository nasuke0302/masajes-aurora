# Aurora Masajista

## Producción: auroramasajista.com

Publicada el 24 de octubre de 2026 en https://auroramasajista.com. El Worker web es `masajes-aurora`; `www.auroramasajista.com` redirige con HTTP 308 al dominio principal conservando ruta y parámetros. Los dos hostnames son Custom Domains del Worker. Los registros de aparcamiento de Hostinger se sustituyeron por los gestionados por Workers.

Producción es una web estática prerenderizada con Nuxt. Solo contiene portada, guía de masaje relajante, páginas legales, imágenes, fuentes, CSS, JavaScript de presentación, sitemap y robots. Muestra «Reservar por WhatsApp» como acción principal. Las rutas `/reservar`, `/reserva/**`, `/admin/**` y `/api/**` devuelven 404 real y se excluyen antes de compilar; no se genera su código de aplicación. La navegación del cliente tampoco incluye esas páginas. Las páginas legales de producción describen el contacto directo, sin formularios ni confirmaciones automáticas.

`masajes-aurora` es un despliegue **assets-only**, sin módulo ejecutable, manifest ni bindings de aplicación. No se invoca código propio ni para URLs inexistentes; `runWorkerFirst` está desactivado. La redirección de `www` se ejecuta en Cloudflare Rules y las cabeceras salen de `config/production-headers`, copiado como `_headers` durante el build. Producción no usa Nuxt SSR, D1, colas, cron, secretos, Access ni Turnstile. Staging conserva sus recursos, autenticación y formularios.

Los scripts fijan `AURORA_PROFILE=production` o `staging` explícitamente, independiente de `NODE_ENV`. Producción carga exclusivamente `.env.production.local` (ignorado por Git), con cuenta, dominio y opciones de presentación; `.env.production.example` documenta los valores públicos. Staging carga `.env.local`. La configuración Cloudflare de producción está en `production.cloudflare.config.ts`; `cloudflare.config.ts` rechaza el modo producción para evitar publicar el backend por error.

Comandos: `npm run build:production` genera la web; `npm run test:production` inspecciona el artefacto y lo prueba en workerd; `npm run deploy:production` compila, verifica y publica solo ese Worker; `npm run verify:production` comprueba el dominio real y que staging conserva Access. `npm run build:cloudflare`, `npm run test:worker` y `npm run deploy` mantienen el flujo completo de staging.

Los artefactos de producción están en `.nuxt-production/`, `.output-production/` y `.cloudflare/production/`; los de staging siguen en `.nuxt/`, `.output/` y `.cloudflare/output/`. No intercambiar paquetes precompilados entre perfiles. El despliegue de producción verifica el perfil, nombre del Worker, ausencia de backend y 404 antes de publicar. No hay fallback SPA (`200.html`) en el paquete estático.

## Protección frente a abuso y gasto variable

La política reproducible está en `config/production-security.json`, limitada a los dos hosts de Aurora. `npm run setup:security -- --validate` valida las reglas sin activarlas; `npm run setup:security -- --apply` las aplica conservando reglas ajenas y guardando el estado anterior en `.data/security-backups/`. Sin opciones, el comando solo verifica la política y la alerta existente. El despliegue de producción exige que esa verificación pase antes de publicar.

- Redirección 308 de `www` al dominio principal, conservando ruta y query, en la fase `http_request_dynamic_redirect`.
- WAF: GET y HEAD únicamente; bloqueo de sondeos a `/.env*`, `/.git*`, `/wp-admin*`, `/wp-login.php` y `/xmlrpc.php`. Las rutas de reservas, admin y API siguen siendo 404.
- Rate limiting: 200 peticiones por IP y centro de datos cada 10 segundos, con bloqueo de 10 segundos. Los bots verificados por Cloudflare quedan excluidos. Es una defensa de ráfagas, no un límite económico global.
- Producción no genera logs ni trazas de ejecución de aplicación. En staging, logs y trazas se muestrean al 1 %. CPU máxima configurada: 100 ms para el web de staging y 1.000 ms para el consumidor de emails; estos límites no equivalen a un presupuesto mensual.
- Los tres despliegues de Aurora deshabilitan `workers.dev` y previews. El consumidor de emails solo conserva su cola, con concurrencia 1, lotes de 5 y hasta 5 reintentos.
- Se conserva la alerta de consumo variable de 2 USD de la cuenta: **solo avisa y no corta el gasto**. El plan y las franquicias se comparten con otros proyectos; servir esta web como assets no elimina la cuota base ni los consumos de esos otros proyectos.

Ante una alerta: revisar Billing y las métricas por Worker antes de atribuirla a esta web; comprobar que producción sigue sin `main_module`, bindings ni observabilidad y que `npm run setup:security` pasa. Revisar Security Events para identificar tráfico bloqueado y rutas atacadas. Si el incidente requiere un desafío adicional, activar temporalmente el modo Under Attack solo en la zona de Aurora, y retirarlo al resolverlo para evitar fricción a visitantes y rastreadores. Mantener Access en staging. No suspender automáticamente toda la cuenta ni modificar los otros proyectos. Si hay que revertir una regla, usar el snapshot anterior y conservar las reglas ajenas.

`npm run verify:production` comprueba en vivo páginas públicas y guía, cabeceras, 404, redirección, bloqueos de sondeos y POST y la protección Access de staging. El test local usa un módulo centinela solo para adaptar Miniflare: no se empaqueta ni despliega, y cualquier invocación hace fallar la prueba.


## Guía de masaje relajante

`/masaje-relajante-avila` es una guía en español compartida por staging y producción, enlazada desde Servicios en portada. `src/pages/masaje-relajante-avila.vue` conserva Urbanist, la paleta existente y la fotografía ilustrativa; añade índice, lectura de hasta 70ch y contacto por WhatsApp. Publicación y modificación: 25 de octubre de 2026. Incluye canonical según el origen, `BlogPosting`, `BreadcrumbList`, entrada en ambos sitemaps y prerender de producción; mantiene la producción estática sin backend.

Validación: `npm run type-check`, `npm run build:production` y `npm run test:production`; tras publicar, `npm run verify:production` comprueba también la guía y su entrada en el sitemap. La revisión independiente de fuente y capturas `.data/screenshots/guide-desktop-full.jpg` y `guide-mobile-full.jpg` devolvió SHIP sin correcciones, limitada a esta guía; no acredita una revisión completa de la web ni un despliegue. `DESIGN.md` y `.impeccable/design.json` conservan la identidad y los tokens existentes.

## Estado inicial

Staging usa pago **solo en efectivo**, con tarifas de **40 € por 40 minutos** y **50 € por 60 minutos**. Las jornadas iniciales son de lunes a domingo, 09:00–21:00 (Europe/Madrid). El acceso privado solo autoriza a **masajesaurora@gmail.com**. El teléfono sigue siendo +34 644 51 71 87.

Se conserva .env.local y sus valores anteriores; únicamente se ha añadido ADMIN_EMAIL. .env.example enumera las nuevas variables. No publiques .env.local ni .data: contienen secretos, enlaces privados o mensajes locales.

## Desarrollo local

Necesitas Node 22.22.3+, 24.15+ o 26+, y npm.

```powershell
npm ci
npm run dev
```

Abre http://localhost:3000. El adaptador de desarrollo usa D1 local persistente en .data/d1. Los emails se escriben en **.data/mail.jsonl** y nunca se envían realmente. Para entrar, visita /admin/acceso, solicita el enlace al email autorizado, abre el enlace guardado en ese archivo y pulsa Entrar. Los enlaces duran 15 minutos y se usan una sola vez; la sesión dura ocho horas.

Para pruebas locales, SITE_URL debe ser http://localhost:3000. Puedes configurar EMAIL_FROM=reservas@localhost exclusivamente en el entorno local; para Workers necesitas un remitente verificado.


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

Una reserva agrupa masajes de 60 minutos, realizados consecutivamente en una sola dirección y con un único pago. **No hay cupo diario**: se pueden reservar las sesiones que quepan en las jornadas, respetando la separación entre visitas. Se suman cantidades, precios y duraciones sin descuentos; se conservan instantáneas de lo contratado.

La jornada ofrece inicios cada diez minutos. Toda la visita debe caber y dejar 30 minutos entre reservas. No se añade pausa dentro del grupo. El servidor exige tres horas de antelación y permite reservar hasta 30 días vista; usa Europe/Madrid y distingue los instantes de los cambios de hora. El desplegable muestra únicamente las horas disponibles y la hora de fin de la sesión, sin datos personales.

Se comprobaron capturas locales del desplegable a 1440px y 390px con cuatro masajes de 60 minutos, catálogo real de staging y disponibilidad calculada con la lógica compartida sobre una agenda vacía de prueba; no se enviaron reservas. Pasan 42 tests y type-check, incluidas conservación de una reserva al migrar, cuatro masajes en una sesión y cuatro masajes entre reservas sin solapamiento, manteniendo separación y antelación. Tras desplegar, test:worker pasó SSR, API, assets, autenticación privada y límite de cuerpo. Chrome sobre staging real, sin fixtures, a 1440px y 390px confirmó cuatro masajes de 60 minutos, API 200 con 240 minutos y 49 horas disponibles (primera 09:00–13:00), sin indicador de cupo restante, desbordamiento horizontal ni errores de página. No se enviaron reservas ni emails.

Los triggers de D1 reservan franjas y evitan solapamientos de forma atómica, incluyendo bloqueos temporales de pago y sesiones realizadas. Las cantidades e importes se validan y calculan en el servidor; el cliente no puede enviar un precio.



## Preparar staging en Cloudflare

El build automático del Worker web de staging usa `npm run build:cloudflare` y despliega con `npm exec -- cf deploy --mode staging --prebuilt`. Debe conservar las variables de build `D1_DATABASE_ID`, `SITE_URL`, `WORKER_DOMAIN`, `NOTIFICATIONS_QUEUE`, `ADMIN_EMAIL`, `EMAIL_FROM` y `TURNSTILE_SITE_KEY`; `TURNSTILE_SECRET_KEY` se guarda como secreto del build. `config/access.json` aporta la configuración de Access. El Worker de emails se despliega junto al web mediante `npm run deploy` cuando cambie su código.

No sustituir este pipeline por el despliegue genérico de Nuxt con `npx wrangler deploy`: su configuración autogenerada no incluye D1, la cola ni las variables de Aurora y puede sobrescribir los bindings del Worker, causando el 503 «El sistema de reservas no está configurado». Después de cada despliegue hay que verificar los bindings de la versión activa y la conexión a D1, además del resultado del build.

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
- EMAIL_FROM: remitente verificado en Resend. Staging reutiliza `Aurora Masajista <reports.staging@orders.geonuvia.com>` de la configuración de Geonuvia.
- RESEND_API_KEY: clave de envío de Resend, solo del servidor; se carga como secreto exclusivamente en el Worker de emails. Las respuestas se dirigen a ADMIN_EMAIL.
- WORKER_DOMAIN: hostname propio opcional, en una zona de la cuenta; cf configura el dominio del Worker. Si usas workers.dev, deja esta variable vacía y ajusta SITE_URL al hostname real.

El remitente debe pertenecer a un dominio verificado en Resend. La integración usa su API HTTPS desde el Worker de notificaciones; no requiere Cloudflare Email Service. La DB y la cola de Aurora staging son independientes de Geonuvia.

```powershell
npm run deploy
```


Para revisar el paquete sin publicar:

```powershell
npm exec -- cf deploy --prebuilt --dry-run --mode staging
npm exec -- cf deploy --prebuilt --dry-run --mode staging --worker masajes-aurora-email-staging
```

### Configuración actual de staging

- Desplegado y reservas abiertas el 11/10/2026. URL: https://aurora-staging.geonuvia.com
- D1: masajes-aurora-staging; cola: masajes-aurora-notifications-staging.
- Tarifas: 40 minutos, 40 €; 60 minutos, 50 €. Lunes a domingo, 09:00–21:00.
- Emails mediante Resend con el remitente de staging de Geonuvia y nombre Aurora Masajista. Acceso privado para masajesaurora@gmail.com.

Se verificaron HTTP 200 en web, reserva, acceso e imágenes, catálogo con tarifas y efectivo, disponibilidad de grupos mixtos y HTTP 401 en la API privada. La URL inicial workers.dev agotaba el tiempo de conexión con la resolución DNS local. Staging se publica temporalmente en aurora-staging.geonuvia.com, actualizando SITE_URL y WORKER_DOMAIN. Se verificó en Chrome con conexión normal: página renderizada, imágenes y JavaScript sin errores, navegación a reservas y canonical con el nuevo origen. Pasan 42 tests, type-check y test:worker.


La migración usa SELECT RAISE(...) WHERE dentro de los triggers y finales LF para evitar los problemas del analizador SQL remoto con CASE/END. Se mantienen las mismas condiciones de antelación, capacidad, solapamiento y bloqueos; las migraciones quedan registradas en d1_migrations.

## Verificación del flujo

Prueba una reserva en efectivo, sus dos emails, el enlace privado y el panel. Comprueba grupos mixtos, jornadas, separación, antelación y Turnstile. Marca la sesión realizada y el cobro en efectivo; verifica cancelaciones y reintentos de avisos.

## Emails, privacidad y observabilidad

Las notificaciones se insertan en outbox en la misma operación que la reserva/confirmación. La cola solo transporta el ID; el Worker de emails obtiene una concesión temporal, entrega y guarda el identificador del proveedor. Los fallos se reintentan; el cron vuelve a encolar los avisos pendientes aunque se agoten los reintentos de un mensaje. El panel muestra intentos/errores y permite reintentar. Un fallo de email no anula una cita.


Los enlaces privados son credenciales: se generan con 256 bits aleatorios, se consultan por hash y se envían por email. Los enlaces completos también viven en las reservas y avisos de D1; protege el acceso a la DB como acceso a datos privados. Las rutas privadas llevan no-store, noindex y no-referrer. Cookies del panel HttpOnly, SameSite=Strict y Secure en HTTPS. Las escrituras comprueban Origin y hay límites de solicitudes por IP. Las notas se escapan al construir HTML del email; no incluyas información médica innecesaria.


npm audit señala avisos transitivos de braces (patrones de glob) y node-forge (tooling de certificados), que se propagan como once avisos altos en la cadena de herramientas de Nuxt. No tienen una versión corregida compatible en este lockfile. simple-git y shell-quote se han actualizado mediante overrides. No se fuerza la bajada de Nuxt que propone audit; revisa las actualizaciones de esas dependencias antes de activar producción. El bundle Worker verificado no incluye el tooling de glob/certificados.

## Activación de producción


El intervalo, antelación y horizonte están en shared/booking.ts. migrations/0002_remove_daily_capacity.sql elimina el cupo diario conservando reservas existentes, separación y antelación; está aplicada en staging y la actualización está desplegada y verificada (versión 2ecaa187-bf92-49db-88c8-afcd68161da7). Cambiar estas reglas requiere una migración nueva coherente con la API y las pruebas.

## Acceso privado de staging

Toda la web y el panel en https://aurora-staging.geonuvia.com usan Cloudflare Access con el proveedor OTP de Geonuvia y el único correo albertoesquivelanias@gmail.com. La sesión dura 24 horas. El código lo envía Cloudflare; Resend sigue enviando las notificaciones de reservas a Aurora y a los clientes. ADMIN_EMAIL conserva masajesaurora@gmail.com para los avisos.

El panel acepta la identidad firmada de Access sin pedir otro enlace. Los endpoints de enlace antiguo se deshabilitan cuando Access está configurado. Salir cierra la sesión de Access. workers.dev y las URL de preview están deshabilitados; el Worker verifica firma RS256, emisor, audiencia, caducidad y email antes de servir web, API o imágenes. Configuración pública en config/access.json; npm run setup:access crea/verifica solo la aplicación y política de Aurora, sin modificar Geonuvia. Cada despliegue staging comprueba esa configuración.


Verificación del despliegue Access (versión 17c36748-5fb1-472a-b6ef-57fd694377fc): 62 tests, type-check y test:worker pasan. Sin sesión, /, /reservar, /admin, /admin/acceso y /api/admin/settings responden 302 hacia geonuvia.cloudflareaccess.com. Chrome muestra el formulario Email / Send login code para Aurora Masajista staging. No se solicitó un OTP ni se completó una sesión real de propietario; esa última comprobación requiere el código del correo autorizado. El despliegue incluye los cambios locales de logo y formulario.

## Turnstile en reservas web

POST /api/bookings exige turnstileToken. El widget Managed aparece al revisar la reserva; el botón de confirmación permanece deshabilitado hasta verificar. Los tokens se renuevan al caducar, editar o fallar el envío, manteniendo datos y requestKey en los reintentos. El panel no requiere Turnstile y mantiene Access.


TURNSTILE_SITE_KEY se publica en Nuxt; TURNSTILE_SECRET_KEY se guarda en .env.local ignorado y se sube únicamente como secreto del Worker web. npm run setup:turnstile crea o verifica el widget staging autorizado para aurora-staging.geonuvia.com, localhost y 127.0.0.1 mediante cf CLI. Cada backend solo acepta su propio hostname, nunca una lista conjunta de dominios locales y staging. El dominio definitivo requiere su configuración antes de producción.

Verificación: 74 tests y type-check pasan; Siteverify real rechazó el token de prueba y validó el secreto sin imprimirlo. Chrome local a 1440px y 390px, con APIs/widget simulados, comprobó botón, caducidad, errores, reintento y requestKey conservado sin crear reservas. El script y el frame reales de Turnstile se comprobaron en 127.0.0.1 a 390px, sin desbordamiento y sin enviar la reserva. La prueba final con un usuario autenticado en staging y un token real enviado a la API requiere una reserva manual; no se ejecutó.

Turnstile desplegado en staging: versión 9878a4db-e2d8-4ffe-b2dc-bc22b928e950. test:worker pasa. Se confirmó que el secreto solo está vinculado al Worker web y que /reservar y /admin siguen redirigiendo a Access sin sesión. Para pruebas locales reales, SITE_URL debe coincidir con el hostname utilizado (localhost o 127.0.0.1).

## Pago exclusivamente en efectivo

Todas las reservas se confirman inmediatamente con cobro pendiente. El panel permite marcar el efectivo cobrado y conserva la fecha del primer cobro. Estados: confirmada, realizada o cancelada; pago pendiente o cobrado. No hay pasarela ni bloqueos de pago. Las notificaciones siguen persistidas en D1 y se reintentan mediante Queues y el cron.

La migración 0003_cash_only conserva los datos, referencias, enlaces privados, importes y estados de las reservas en efectivo; elimina columnas y tablas de la antigua pasarela. Las migraciones 0001 y 0002 se conservan como historial inmutable ya aplicado. La migración nueva rechaza filas incompatibles antes de sustituir la tabla. No requiere nuevas variables de pagos.

Actualización a efectivo desplegada en staging (21cc0bd1-db87-4297-a590-1519073bd05f). Pasan 65 tests, type-check, compilación y test:worker. Preview del bundle comprobado en Chrome a 1440px/390px con catálogo simulado: solo efectivo, sin selector de pago ni desbordamiento. La DB staging conserva cero reservas y no contiene tablas de eventos de la pasarela retirada. Access y Turnstile permanecen. No se crearon reservas ni se enviaron emails reales.

## Direcciones verificadas en Ávila

Calle y número requiere elegir un portal de CartoCiudad (IGN/CNIG). Piso y puerta se indican aparte. GET /api/addresses/search?q=… devuelve como máximo ocho portales, con límite de 40 consultas por IP y minuto. Debounce de 350 ms y cancelación de consultas obsoletas en el formulario; teclado con flechas/Enter/Escape. Editar el texto elimina la selección y bloquea la revisión.

Antes de crear una reserva, el servidor vuelve a consultar find por ID y portal. Exige tipo portal, número existente, coordenadas válidas, municipio 05019 y población Ávila; otras localidades del término municipal quedan fuera. Se usa la pertenencia poblacional oficial de CartoCiudad, sin inventar un polígono urbano. La dirección guardada procede del proveedor, más el piso/puerta y Ávila capital; se ignora cualquier dirección o coordenadas manipuladas por el cliente. El panel aplica la misma validación de dirección, sin Turnstile adicional. Fallos del proveedor o direcciones no verificables impiden guardar y ofrecen contacto por WhatsApp.

No se usa Geoapify ni se copian claves de Geonuvia. CartoCiudad no necesita clave en este flujo. No se envían al geocodificador nombre, email, teléfono, notas ni piso/puerta. No hay nueva migración: se conserva la dirección canónica en el campo existente.

Direcciones desplegadas en staging: 028454e4-0005-480e-b4fb-40e6ae1abcb6. Pasan 81 tests, tipos, compilación y smoke del Worker. Chrome sobre preview aislado a 1440px/390px comprobó búsqueda CartoCiudad real, selección con teclado, bloqueo sin selección, invalidación al editar y error controlado del proveedor, sin desbordamiento. Catálogo y horario fueron fixtures; no se crearon reservas ni se enviaron emails. Access sigue protegiendo staging. La comprobación de pertenencia usa el núcleo poblacional oficial devuelto por CartoCiudad, no un polígono manual.

Ajustes de formulario: labels opcionales en línea, seis campos obligatorios con asterisco coral, fecha/hora apiladas y a ancho completo bajo 640px. Sugerencias en dropdown absoluto con scroll y navegación por teclado. Chrome sobre preview a 1440px/390px/320px confirmó etiquetas inline, layout móvil, ausencia de desplazamiento de campos al abrir sugerencias y ausencia de desbordamiento. Pruebas con catálogo, horarios y direcciones simulados; no se enviaron reservas. Tipos y compilación pasan.

## Arrastre de reservas en ordenador

La vista semanal inicializa el módulo drag de Vue Cal incluso mientras carga datos; cada evento individual bloquea arrastre durante carga, si está realizado o si no es futuro. Cambiar Semana/Mes remonta la instancia para inicializar el módulo al volver. El contenido de evento usa un div con rol button y activación por Enter/Espacio, evitando el botón HTML que interfería con el arrastre nativo. El detalle ya no incluye el formulario de reprogramación manual.

Chrome con ratón real sobre preview aislado y API simulada confirmó movimiento de 11:00 a 12:00 Madrid, PATCH con expectedStartAt correcto, actualización tras éxito, restauración tras HTTP 409 y funcionamiento después de Mes→Semana; también se probó navegador con zona America/New_York. No se movieron reservas reales ni se enviaron emails. La corrección se refiere a ordenador; el motor nativo de Vue Cal v4 tiene soporte limitado para táctil.

Durante el arrastre semanal se muestra un indicador flotante con el día y las horas de inicio y fin previstas. Respeta el punto de agarre, la duración y el ajuste de diez minutos de Vue Cal; desaparece al soltar, cancelar o salir de la agenda. No guarda cambios antes de soltar. Verificado con ratón real y API simulada: éxito, conflicto y retorno Mes→Semana, incluyendo navegador en otra zona horaria.

La vista mensual muestra solo la fecha y el número de citas de cada día, incluyendo cero. Cada reserva cuenta una vez aunque agrupe varios masajes; se incluyen confirmadas y realizadas y se excluyen canceladas. No muestra nombres, horarios, jornadas ni bloqueos dentro de las celdas. Verificado en Chrome a 1440px y 390px con datos simulados; tipos y compilación pasan.

## Páginas legales y conservación

Las páginas /aviso-legal, /privacidad, /cookies y /condiciones-reserva usan los datos y decisiones confirmados por la titular. La reserva exige aceptar la versión vigente de condiciones y confirmar que todas las personas son adultas. Si empieza antes de 14 días, se registra la solicitud expresa y el reconocimiento sobre desistimiento. Las confirmaciones incluyen una copia de las condiciones; las notas logísticas no se envían por email.

La migración 0004_privacy.sql se aplicó en staging el 12 de octubre de 2026. Antes de desplegar en otra base, aplica las migraciones pendientes con cf. El mantenimiento elimina reservas tras 12 meses y emails de la cola tras 30 días. El control Conservar por reclamación abierta del admin excluye la reserva y sus avisos asociados del borrado; retíralo al resolver el caso. El buzón de Aurora, los backups y la contabilidad externa se gestionan por separado.

La tipografía se sirve localmente con licencia OFL. El build y la prueba Workers verifican las páginas y API, pero queda pendiente el inventario de cookies y la revisión visual en un navegador conectado. No se ha hecho push ni despliegue de estos cambios.
