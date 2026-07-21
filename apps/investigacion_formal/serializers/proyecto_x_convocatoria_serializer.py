from rest_framework import serializers

from apps.investigacion_formal.models import ProyectoXConvocatoria


class ProyectoXConvocatoriaSerializer(serializers.ModelSerializer):
    proyecto_titulo = serializers.CharField(
        source='proyecto.titulo',
        read_only=True
    )
    proyecto_codigo = serializers.CharField(
        source='proyecto.codigo',
        read_only=True
    )
    convocatoria_nombre = serializers.CharField(
        source='convocatoria.nombre_convocatoria',
        read_only=True
    )
    convocatoria_interno = serializers.BooleanField(
        source='convocatoria.interno',
        read_only=True
    )

    class Meta:
        model = ProyectoXConvocatoria
        fields = '__all__'