from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.usuarios.models import RolXUsuario


class MeView(APIView):
    """
    Devuelve los datos del usuario autenticado y sus roles activos.

    Por qué existe: RolXUsuarioViewSet (roles-usuario/) está protegido
    con EsSoporte en TODAS sus acciones, incluida 'ver-roles', así que
    un usuario normal no puede consultar ni siquiera sus propios roles
    a través de ese endpoint. El frontend necesita saber "quién soy y
    qué roles tengo" justo después del login para pintar menús y
    proteger rutas, así que se expone aquí, autoprotegido por el propio
    request.user (nadie puede ver los roles de otro usuario por esta vía).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        roles = (
            RolXUsuario.objects
            .select_related('rol')
            .filter(usuario=request.user, estado=True)
            .values_list('rol__nombre_rol', flat=True)
        )

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "debe_cambiar_password": request.user.debe_cambiar_password,
            "roles": list(roles),
        })