# Seguridad

## Autenticación

- **JWT** vía `rest_framework_simplejwt`. Access token de 30 minutos, refresh de 1 día, con rotación de refresh tokens activada.
- **Blacklist de tokens** en logout y en desactivación de usuario. La invalidación se hace iterando `OutstandingToken.objects.filter(user=user)` y ejecutando `BlacklistedToken.objects.get_or_create(token=token)` por cada uno — se prefiere este patrón sobre `RefreshToken().blacklist()` porque invalida **todas** las sesiones activas del usuario (todos sus refresh tokens vigentes), no solo la sesión desde la que se ejecuta la acción. Esto es clave para el caso de desactivación forzada de un usuario.
- **`UsuarioXPersona`** es la tabla intermedia que permite que una cuenta institucional (p. ej. `director.facultad.ciencias@...`) persista aunque la `Persona` que ocupa ese cargo rote. El historial de quién ocupó el cargo y cuándo queda auditado ahí, no se pierde al reasignar la cuenta.

## Control de fuerza bruta y throttling

- **`django-axes`**: bloqueo tras 5 intentos fallidos de login, con cooloff de 1 hora antes de permitir reintentar. El contador se reinicia automáticamente tras un login exitoso.
- **Throttling de DRF** (independiente de Axes, actúa a nivel de framework):
  - `anon`: 20 peticiones/minuto
  - `user`: 100 peticiones/minuto
  - `login`: 5 peticiones/minuto, vía `LoginRateThrottle` personalizado
- La combinación Axes + throttle de login cubre dos escenarios distintos: Axes bloquea por credenciales incorrectas repetidas, el throttle limita la tasa de peticiones al endpoint de login independientemente de si las credenciales son correctas o no (protege contra scripts que golpean el endpoint aunque no estén "fallando" intentos registrables por Axes).
- **reCAPTCHA** en formularios sensibles del frontend (llaves configuradas vía `RECAPTCHA_PUBLIC_KEY` / `RECAPTCHA_PRIVATE_KEY`).

## Control de acceso y roles

Usuarios → roles → permisos. Los roles institucionales identificados (`Asesor`, `Cexterno`, `Cinterno`, `Decano`, `Estudiante`, `Facultad`, `Gerente`, `Grupo`, `Jurado`, `Soporte`, `Supervisor`, `Tutor`) se traducen en el backend a clases de permiso DRF por rol, evaluadas en `get_permissions()` de cada `ViewSet` — nunca dentro de la capa de `services` (ver `11_backend_logic.md`).

Clases de permiso implementadas hasta ahora (roles con lógica ya construida en `investigacion_formal`):

- `EsSoporte`
- `EsFacultad`
- `EsCInterno`
- `EsCExterno`
- `EsAsesor`
- `EsSupervisor`
- `EsDecano`
- `EsGerente`
- `EsGrupo`

Los roles `Estudiante`, `Jurado` y `Tutor` están definidos a nivel de dominio (rol dentro de `PersonaXGrupo` / `ParticipanteProceso`) pero todavía no tienen una clase de permiso DRF propia porque su lógica de acceso vive en `investigacion_formativa`, aún no implementada a nivel de vista.

## Registro de auditoría

Toda mutación de cualquier módulo pasa por `HistorialService.registrar(ejecutor, descripcion, objeto=None)`. `Historial` es append-only (no expone `actualizar()` ni `eliminar()`) y usa `GenericForeignKey` para poder auditar cualquier modelo del sistema sin tablas de historial por módulo. `ejecutor` siempre es el usuario que ejecuta la acción (`request.user`), no el usuario afectado por el cambio — esto importa quede claro en logs donde un `Soporte` modifica datos de otra persona.

## Seguridad de transporte y cabeceras (por ambiente)

Configurado de forma incremental según el ambiente (ver `09_deployment.md` para el detalle completo):

- `local` / `development`: sin HTTPS forzado, para no bloquear el desarrollo.
- `stage`: `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE` y `CSRF_COOKIE_SECURE` activos; HSTS todavía desactivado a propósito mientras se valida el certificado.
- `production`: además de lo anterior, HSTS a 1 año con subdominios y preload, `X_FRAME_OPTIONS="DENY"`, cookies `HttpOnly`, y soporte para operar detrás de proxy vía `SECURE_PROXY_SSL_HEADER`.

## CORS

`CORS_ALLOWED_ORIGINS` está definido en `base.py` y heredado por todos los ambientes — actualmente apunta solo a `http://localhost:3000` (frontend React en desarrollo local). **Pendiente**: parametrizar por ambiente antes de desplegar a `stage`/`production`, para no dejar ese origen de desarrollo habilitado en producción ni bloquear el dominio real del frontend desplegado.

## Pendiente

- Definir clases de permiso DRF para `Estudiante`, `Jurado` y `Tutor` cuando se implemente la capa de vistas de `investigacion_formativa`.
- Parametrizar `CORS_ALLOWED_ORIGINS` por ambiente.
- Evaluar si `Aprobacion`/`DocumentoFirmante` en estado pendiente deberían integrarse con Axes-style de alerta o solo quedarse en el sistema de `Notificacion` (ver `08_notifications.md`).