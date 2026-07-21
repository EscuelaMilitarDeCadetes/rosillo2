# Despliegue

## Estructura de settings

`config/settings/` está dividido por ambiente, todos heredan de `base.py`:

- `base.py` — apps instaladas, middleware, DB, DRF, JWT, Axes, CORS, reCAPTCHA, sesiones, logging. Lee todo lo sensible desde `.env` (vía `python-dotenv`).
- `local.py` — `DEBUG=True`, `ALLOWED_HOSTS=['localhost', '127.0.0.1']`, HTTPS/HSTS desactivados. Para desarrollo en máquina local.
- `development.py` — igual a `local.py` pero `ALLOWED_HOSTS` viene de la variable de entorno `ALLOWED_HOSTS`. Pensado para un ambiente de desarrollo compartido/remoto.
- `stage.py` — `DEBUG=False`, fuerza `SECURE_SSL_REDIRECT`/`SESSION_COOKIE_SECURE`/`CSRF_COOKIE_SECURE`, pero **HSTS sigue en 0** (a propósito, para no forzar HTTPS permanentemente mientras se prueba en stage).
- `production.py` — `DEBUG=False`, todo el endurecimiento de seguridad activo: HSTS a 1 año con subdominios y preload, `X_FRAME_OPTIONS="DENY"`, cookies `HttpOnly`, `SECURE_PROXY_SSL_HEADER` para operar detrás de proxy/load balancer.

`manage.py`, `wsgi.py` y `asgi.py` apuntan por defecto a `config.settings.local`. **Al desplegar hay que cambiar `DJANGO_SETTINGS_MODULE`** (o exportar la variable de entorno) al módulo correcto (`config.settings.stage` o `config.settings.production`) — esto no ocurre automáticamente.

## Variables de entorno (`.env`)

Cargadas por `base.py` desde `BASE_DIR / '.env'`. Como mínimo se requieren:

- `SECRET_KEY`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `ALLOWED_HOSTS` (en `development`/`stage`/`production`)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`
- `RECAPTCHA_PUBLIC_KEY`, `RECAPTCHA_PRIVATE_KEY`
- `DOCUMENTOS_ROOT` (opcional, default `C:\RUTA_DOCUMENTOS_ROSILLO`)

## Base de datos

PostgreSQL, configurada 100% por variables de entorno (`DATABASES['default']` en `base.py`). No hay `sqlite` de respaldo — todos los ambientes, incluido local, requieren Postgres corriendo.

## Archivos estáticos y media

- `STATIC_ROOT = BASE_DIR / 'staticfiles'` — requiere `collectstatic` antes de servir en stage/producción (no hay configuración de `whitenoise` ni CDN todavía).
- `MEDIA_ROOT = BASE_DIR / 'media'` y `DOCUMENTOS_ROOT` (ver `04_document_management.md`) son rutas de disco separadas de `MEDIA_ROOT` — hay que asegurarse de que existan y tengan permisos de escritura en el servidor destino.


## Pasos de despliegue (checklist)

1. Configurar `.env` del ambiente destino.
2. `DJANGO_SETTINGS_MODULE=config.settings.<ambiente>`
3. `python manage.py migrate`
4. `python manage.py collectstatic --noinput`
6. Levantar WSGI (`config.wsgi.application`) detrás de un servidor de aplicación (gunicorn/uwsgi) + proxy (nginx).
7. Verificar que `DOCUMENTOS_ROOT` y sus subcarpetas existen y son escribibles por el usuario del proceso.

## Pendiente / riesgos conocidos

- **No hay Celery ni cron configurado.** `NotificacionService.enviar_recordatorios_tareas()` existe pero nada lo dispara automáticamente — falta definir el worker/scheduler y agregarlo al despliegue.
- **`CORS_ALLOWED_ORIGINS` no está parametrizado por ambiente** (ver arriba).
- **No hay `Dockerfile`/`docker-compose` ni pipeline CI/CD documentado** en el repositorio hasta la fecha — el despliegue actual es manual.
- **Postman**: solo se ha validado el módulo `usuarios` end-to-end; falta ejecutar la colección completa contra `investigacion_formal` (recién completado) antes de considerar el backend listo para stage.
- Confirmar si `production.py` necesita `SECURE_HSTS_SECONDS` reducido en el primer despliegue (activar HSTS de un año inmediatamente puede ser riesgoso si el certificado SSL aún no está 100% estable en el dominio).