from rest_framework import serializers

from apps.investigacion_formal.models import TipoCalificacion


class TipoCalificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCalificacion
        fields = '__all__'