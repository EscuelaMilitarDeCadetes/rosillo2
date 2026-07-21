from apps.investigacion_formal.pagination import InvestigacionFormalPageNumberPagination
from apps.usuarios.permissions.es_asesor import EsAsesor
from apps.usuarios.permissions.es_cexterno import EsCExterno
from apps.usuarios.permissions.es_cinterno import EsCInterno
from apps.usuarios.permissions.es_decano import EsDecano
from apps.usuarios.permissions.es_facultad import EsFacultad
from apps.usuarios.permissions.es_gerente import EsGerente
from apps.usuarios.permissions.es_grupo import EsGrupo
from apps.usuarios.permissions.es_supervisor import EsSupervisor
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.investigacion_formal.serializers.tipo_producto_serializer import TipoProductoSerializer
from apps.investigacion_formal.services.tipo_producto_service import TipoProductoService
from apps.usuarios.permissions import EsSoporte


class TipoProductoViewSet(viewsets.ViewSet):
    serializer_class = TipoProductoSerializer
    pagination_class = InvestigacionFormalPageNumberPagination
    
    def get_permissions(self):
        if self.action in ["create", "update"]:
            permission_classes = [EsSoporte]
        else: #list, retrieve, aplicables
            permission_classes = [
                EsSoporte | EsFacultad | EsGrupo | EsCInterno | EsCExterno
                | EsAsesor | EsSupervisor | EsDecano | EsGerente
            ]
        return [permission() for permission in permission_classes]

    def list(self, request):
        tipos = TipoProductoService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(tipos, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        tipo = TipoProductoService.obtener(pk)
        return Response(self.serializer_class(tipo).data)

    def create(self, request):
        tipo = TipoProductoService.crear(
            tipo_producto=request.data.get("tipo_producto"),
            aplica=request.data.get("aplica"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(tipo).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        tipo = TipoProductoService.actualizar(
            tipo_producto_id=pk,
            tipo_producto=request.data.get("tipo_producto"),
            aplica=request.data.get("aplica"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(tipo).data)

    @action(detail=False, methods=["get"], url_path="aplicables")
    def aplicables(self, request):
        tipos = TipoProductoService.listar_aplicables()
        return Response(self.serializer_class(tipos, many=True).data)