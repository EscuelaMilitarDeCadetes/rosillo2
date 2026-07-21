from rest_framework.permissions import BasePermission
from apps.usuarios.models import RolXUsuario


class EsCExterno(BasePermission):
    def has_permission(self, request, view):
        return RolXUsuario.objects.filter(
            usuario=request.user,
            rol__nombre_rol='CEXTERNO',
            estado=True
        ).exists()