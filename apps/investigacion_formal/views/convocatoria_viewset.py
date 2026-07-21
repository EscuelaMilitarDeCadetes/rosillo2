from apps.investigacion_formal.pagination import InvestigacionFormalPageNumberPagination
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.investigacion_formal.serializers.convocatoria_serializer import ConvocatoriaSerializer
from apps.investigacion_formal.services.convocatoria_service import ConvocatoriaService
from apps.usuarios.permissions import EsAsesor, EsCInterno


class ConvocatoriaViewSet(viewsets.ViewSet):
    serializer_class = ConvocatoriaSerializer
    pagination_class = InvestigacionFormalPageNumberPagination

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [EsAsesor]
        elif self.action == "cambiar_estado":
            permission_classes = [EsCInterno]
        else: #list, retrieve, activas, internas, externas
            permission_classes = [EsCInterno]
        return [permission() for permission in permission_classes]

    def list(self, request):
        convocatorias = ConvocatoriaService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(convocatorias, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        convocatoria = ConvocatoriaService.obtener(pk)
        return Response(self.serializer_class(convocatoria).data)

    def create(self, request):
        convocatoria = ConvocatoriaService.crear(
            nombre_convocatoria=request.data.get("nombre_convocatoria"),
            anio_convocatoria=request.data.get("anio_convocatoria"),
            inicio=request.data.get("inicio"),
            cierre=request.data.get("cierre"),
            interno=request.data.get("interno"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(convocatoria).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], url_path="cambiar-estado")
    def cambiar_estado(self, request, pk=None):
        convocatoria = ConvocatoriaService.cambiar_estado(
            convocatoria_id=pk,
            nuevo_estado=request.data.get("estado"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(convocatoria).data)

    @action(detail=False, methods=["get"], url_path="activas")
    def activas(self, request):
        convocatorias = ConvocatoriaService.listar_activas()
        return Response(self.serializer_class(convocatorias, many=True).data)

    @action(detail=False, methods=["get"], url_path="internas")
    def internas(self, request):
        estado = request.query_params.get("estado")
        estado = estado.lower() == "true" if estado is not None else None
        convocatorias = ConvocatoriaService.listar_internas(estado=estado)
        return Response(self.serializer_class(convocatorias, many=True).data)

    @action(detail=False, methods=["get"], url_path="externas")
    def externas(self, request):
        estado = request.query_params.get("estado")
        estado = estado.lower() == "true" if estado is not None else None
        convocatorias = ConvocatoriaService.listar_externas(estado=estado)
        return Response(self.serializer_class(convocatorias, many=True).data)