from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from apps.usuarios.models import RolXUsuario, RolPlataforma
from apps.common.services.historial_service import HistorialService
from django.db import transaction

User = get_user_model()


class RolXUsuarioService:

    @staticmethod
    @transaction.atomic
    def agregar_rol_a_usuario(usuario_id: int, rol_id: int, ejecutor=None) -> RolXUsuario:
        usuario = get_object_or_404(User, pk=usuario_id)
        rol = get_object_or_404(RolPlataforma, pk=rol_id)

        rxu, created = RolXUsuario.objects.get_or_create(
            usuario=usuario,
            rol=rol,
            defaults={'estado': True}
        )

        auditor = ejecutor if ejecutor is not None else usuario

        if created:
            HistorialService.registrar(
                auditor,
                f"Asignó el rol '{rol.nombre_rol}' al usuario '{usuario.username}'.",
                objeto=rxu,
            )
        elif not rxu.estado:
            rxu.estado = True
            rxu.save(update_fields=['estado'])
            HistorialService.registrar(
                auditor,
                f"Reactivó el rol '{rol.nombre_rol}' (previamente retirado) "
                f"al usuario '{usuario.username}'.",
                objeto=rxu,
            )
        # si ya existía y ya estaba activo, no se registra nada nuevo (idempotente)

        return rxu

    @staticmethod
    @transaction.atomic
    def borrar_rol_de_usuario(usuario_id: int, rol_id: int, ejecutor=None) -> RolXUsuario:
        rxu = get_object_or_404(
            RolXUsuario,
            usuario_id=usuario_id,
            rol_id=rol_id,
            estado=True
        )
        rxu.estado = False
        rxu.save(update_fields=['estado'])

        auditor = ejecutor if ejecutor is not None else rxu.usuario
        HistorialService.registrar(
            auditor,
            f"Removió el rol '{rxu.rol.nombre_rol}' del usuario '{rxu.usuario.username}'.",
            objeto=rxu,
        )
        return rxu

    @staticmethod
    def listar_roles_de_usuario(usuario_id: int):
        return RolXUsuario.objects.select_related('rol').filter(
            usuario_id=usuario_id,
            estado=True
        )

    # --- NUEVO: para completar el ciclo de auditoría que pedía ChatGPT ---
    @staticmethod
    def listar_roles_historico_de_usuario(usuario_id: int):
        return RolXUsuario.objects.select_related('rol').filter(
            usuario_id=usuario_id
        )