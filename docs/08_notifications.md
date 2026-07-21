# Sistema de notificaciones

Sistema de alertas internas de la plataforma, complementario al envío de correo electrónico.
Vive en el módulo `common` (`Notificacion`, `NotificacionService`, `NotificacionSelector`, `NotificacionValidator`, `NotificacionViewSet`).

## Modelo: `Notificacion`

| Campo                     | Tipo                  | Notas |
| `usuario_destino`         | FK a `Usuario`        | destinatario |
| `mensaje`                 | TextField             | obligatorio |
| `tipo`                    | CharField             | `info`, `exito`, `alerta`, `error` (opcional) |
| `leido`                   | BooleanField          | default `False` |
| `fecha_creacion`          | DateTimeField         | `auto_now_add` |
| `url_relacionada`         | CharField(255)        | opcional, para deep-linking desde el frontend |

Ordenamiento por defecto: `-fecha_creacion`.

## Servicio: `NotificacionService`

- `crear(usuario_destino_id, mensaje, tipo=None, url_relacionada=None, notificar_email=False)`
- `marcar_leida(notificacion_id)`
- `marcar_todas_leidas(usuario_id)` → retorna cantidad actualizada
- `listar_por_usuario(usuario_id, solo_no_leidas=False)`
- `contar_no_leidas(usuario_id)`
- `eliminar(notificacion_id, ejecutor)` — registra en `Historial`
- `enviar_recordatorios_tareas(dias_anticipacion=3)`:
  - Recorre `Tarea` vencidas (`TareaSelector.listar_vencidas()`) y próximas a vencer (`listar_proximas_a_vencer()`).
  - Por cada una genera una `Notificacion` tipo `alerta` + intenta enviar email (`notificar_email=True`).
  - Evita duplicar el mismo aviso el mismo día para la misma tarea vía `NotificacionSelector.existe_recordatorio_hoy(usuario_id, url_relacionada, tipo='alerta')`.
  - Al finalizar registra un resumen en `Historial` con `usuario=None` (acción de sistema).

## Envío de correo

`notificar_email=True` dispara `NotificacionService._enviar_email()`, que llama `send_mail()` directamente con `DEFAULT_FROM_EMAIL`. **El envío es síncrono**: ocurre dentro de la misma llamada al servicio, no hay cola de tareas. Cualquier excepción de envío se silencia (`try/except Exception: pass`) para no romper la creación de la notificación.

## Endpoints — `NotificacionViewSet` (`/api/common/notificacion/`)

- CRUD estándar (`list`, `retrieve`, `create`, `destroy`)
- `POST /marcar-leida/<id>/`
- `POST /marcar-todas-leidas/` (usa `request.user` si no se pasa `usuario_destino`)
- `GET /por-usuario/<usuario_id>/?solo_no_leidas=true`
- `GET /no-leidas/<usuario_id>/`
- `POST /enviar-recordatorios/` — **restringido a `IsAdminUser`**, dispara el job de recordatorios manualmente con `dias_anticipacion` opcional en el body

## Pendiente

- **Programación automática**: `enviar_recordatorios_tareas()` existe y funciona, pero no hay Celery beat ni cron configurado que lo dispare periódicamente. Hoy solo corre si alguien llama al endpoint admin manualmente.
- **Notificaciones en tiempo real**: no hay WebSockets/Channels. El frontend debe hacer polling sobre `no-leidas/<usuario_id>/`.
- **Desacoplar el envío de email**: al ser síncrono, un SMTP lento bloquea el request. Si se implementa el módulo de email (deliberadamente diferido, ver `10_future_improvements.md`), debería moverse el envío a una tarea asíncrona.
- **Relación con `Tarea` / `Aprobacion`**: los recordatorios cubren `Tarea`, pero no hay un mecanismo equivalente para avisar sobre `Aprobacion` pendientes o `DocumentoFirmante` en estado `PENDIENTE` — vale la pena evaluar si deben generar notificaciones también.