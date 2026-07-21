from apps.common.pagination import CommonPageNumberPagination
from apps.usuarios.permissions.es_soporte import EsSoporte
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.common.serializers import PlantillaDocumentoSerializer
from apps.common.services.plantilla_documento_service import PlantillaDocumentoService


class PlantillaDocumentoViewSet(viewsets.ViewSet):
    serializer_class = PlantillaDocumentoSerializer
    pagination_class = CommonPageNumberPagination

    def get_permissions(self):
        acciones_autoservicio = ['list', 'retrieve', 'por_tipo_documento']
        if self.action in acciones_autoservicio:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [EsSoporte]
        return [permission() for permission in permission_classes]

    def list(self, request):
        plantillas = PlantillaDocumentoService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(plantillas, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        plantilla = PlantillaDocumentoService.obtener(pk)
        return Response(self.serializer_class(plantilla).data)

    def create(self, request):
        plantilla = PlantillaDocumentoService.crear(
            tipo_documento_id=request.data.get("tipo_documento"),
            ruta_documento=request.data.get("ruta_documento"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(plantilla).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        plantilla = PlantillaDocumentoService.actualizar(
            plantilla_id=pk,
            ejecutor=request.user,
            ruta_documento=request.data.get("ruta_documento"),
        )
        return Response(self.serializer_class(plantilla).data)

    @action(detail=True, methods=["post"])
    def desactivar(self, request, pk=None):
        plantilla = PlantillaDocumentoService.desactivar(pk, ejecutor=request.user)
        return Response(self.serializer_class(plantilla).data)

    @action(detail=False, methods=["get"], url_path="por-tipo-documento")
    def por_tipo_documento(self, request):
        tipo_documento_id = request.query_params.get("tipo_documento")
        plantilla = PlantillaDocumentoService.obtener_por_tipo_documento(tipo_documento_id)
        if plantilla is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(self.serializer_class(plantilla).data)