from rest_framework import serializers

from apps.investigacion_formal.models import Proyecto


class ProyectoSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(
        source='usuario.username',
        read_only=True
    )
    gerente_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Proyecto
        fields = '__all__'

    def get_gerente_nombre(self, obj):
        persona = obj.gerente.persona
        if persona is None:
            return None
        return f"{persona.nombre} {persona.apellido}"