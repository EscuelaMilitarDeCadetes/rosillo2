# apps/investigacion_formativa/serializers/instancia_etapa_serializer.py

from rest_framework import serializers

from apps.investigacion_formativa.models import InstanciaEtapa


class InstanciaEtapaSerializer(serializers.ModelSerializer):

    proceso_titulo = serializers.CharField(
        source='proceso.titulo',
        read_only=True,
    )
    etapa_nombre = serializers.CharField(
        source='etapa.nombre',
        read_only=True,
    )

    class Meta:
        model = InstanciaEtapa
        fields = '__all__'