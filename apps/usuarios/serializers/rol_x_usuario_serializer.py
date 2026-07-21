from rest_framework import serializers
from apps.usuarios.models import RolXUsuario


class RolXUsuarioSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(
        source='usuario.username',
        read_only=True
    )
    rol_nombre = serializers.CharField(
        source='rol.nombre_rol',
        read_only=True
    )

    class Meta:
        model = RolXUsuario
        fields = '__all__'