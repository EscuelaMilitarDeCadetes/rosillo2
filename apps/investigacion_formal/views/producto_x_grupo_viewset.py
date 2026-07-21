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

from apps.investigacion_formal.serializers.producto_x_grupo_serializer import (
    ProductoXGrupoSerializer,
)
from apps.investigacion_formal.services.producto_x_grupo_service import ProductoXGrupoService
from apps.usuarios.permissions import EsSoporte


class ProductoXGrupoViewSet(viewsets.ViewSet):
    serializer_class = ProductoXGrupoSerializer
    pagination_class = InvestigacionFormalPageNumberPagination
    
    def get_permissions(self):
        if self.action in ["create", "update"]:
            permission_classes = [EsSoporte]
        else: #list, retrieve, por_producto_minciencias, por_grupo_minciencias, por_tipo_producto
            permission_classes = [
                EsSoporte | EsFacultad | EsGrupo | EsCInterno | EsCExterno
                | EsAsesor | EsSupervisor | EsDecano | EsGerente
            ]
        return [permission() for permission in permission_classes]

    def list(self, request):
        registros = ProductoXGrupoService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(registros, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        registro = ProductoXGrupoService.obtener(pk)
        return Response(self.serializer_class(registro).data)

    def create(self, request):
        registro = ProductoXGrupoService.crear(
            producto_minciencias_id=request.data.get("producto_minciencias"),
            grupo_minciencias_id=request.data.get("grupo_minciencias"),
            tipo_producto_id=request.data.get("tipo_producto"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(registro).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        registro = ProductoXGrupoService.actualizar(
            producto_x_grupo_id=pk,
            producto_minciencias_id=request.data.get("producto_minciencias"),
            grupo_minciencias_id=request.data.get("grupo_minciencias"),
            tipo_producto_id=request.data.get("tipo_producto"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(registro).data)

    @action(detail=False, methods=["get"], url_path="por-producto-minciencias/(?P<producto_minciencias_id>[^/.]+)")
    def por_producto_minciencias(self, request, producto_minciencias_id=None):
        registro = ProductoXGrupoService.obtener_por_producto_minciencias(producto_minciencias_id)
        if registro is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(self.serializer_class(registro).data)

    @action(detail=False, methods=["get"], url_path="por-grupo-minciencias/(?P<grupo_minciencias_id>[^/.]+)")
    def por_grupo_minciencias(self, request, grupo_minciencias_id=None):
        registros = ProductoXGrupoService.listar_por_grupo_minciencias(grupo_minciencias_id)
        return Response(self.serializer_class(registros, many=True).data)

    @action(detail=False, methods=["get"], url_path="por-tipo-producto/(?P<tipo_producto_id>[^/.]+)")
    def por_tipo_producto(self, request, tipo_producto_id=None):
        registros = ProductoXGrupoService.listar_por_tipo_producto(tipo_producto_id)
        return Response(self.serializer_class(registros, many=True).data)