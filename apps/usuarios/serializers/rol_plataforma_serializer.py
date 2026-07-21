from rest_framework import serializers
from apps.usuarios.models import RolPlataforma


class RolPlataformaSerializer(serializers.ModelSerializer):

    class Meta:
        model = RolPlataforma
        fields = '__all__'