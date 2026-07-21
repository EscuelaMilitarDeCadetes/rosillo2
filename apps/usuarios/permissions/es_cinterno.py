from rest_framework.permissions import BasePermission
from apps.usuarios.models import RolXUsuario


class EsCInterno(BasePermission):
    def has_permission(self, request, view):
        return RolXUsuario.objects.filter(
            usuario=request.user,
            rol__nombre_rol='CINTERNO',
            estado=True
        ).exists()