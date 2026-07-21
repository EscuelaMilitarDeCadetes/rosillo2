from rest_framework import viewsets

from apps.investigacion_formativa.models import Modalidad
from apps.investigacion_formativa.serializers import ModalidadSerializer

class ModalidadViewSet(viewsets.ModelViewSet):
    queryset = Modalidad.objects.all()
    serializer_class = ModalidadSerializer