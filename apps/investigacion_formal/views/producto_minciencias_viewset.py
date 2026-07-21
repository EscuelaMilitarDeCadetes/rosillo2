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

from apps.investigacion_formal.serializers.producto_minciencias_serializer import (
    ProductoMincienciasSerializer,
)
from apps.investigacion_formal.services.producto_minciencias_service import (
    ProductoMincienciasService,
)
from apps.usuarios.permissions import EsSoporte


class ProductoMincienciasViewSet(viewsets.ViewSet):
    serializer_class = ProductoMincienciasSerializer
    pagination_class = InvestigacionFormalPageNumberPagination
    
    def get_permissions(self):
        if self.action in ["create", "update"]:
            permission_classes = [EsSoporte]
        else: #list, retrieve, por_proyecto
            permission_classes = [
                EsSoporte | EsFacultad | EsGrupo | EsCInterno | EsCExterno
                | EsAsesor | EsSupervisor | EsDecano | EsGerente
            ]
        return [permission() for permission in permission_classes]

    def list(self, request):
        productos = ProductoMincienciasService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(productos, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        producto = ProductoMincienciasService.obtener(pk)
        return Response(self.serializer_class(producto).data)

    def create(self, request):
        producto = ProductoMincienciasService.crear(
            nombre_producto=request.data.get("nombre_producto"),
            nomenclatura=request.data.get("nomenclatura"),
            peso=request.data.get("peso"),
            vigencia=request.data.get("vigencia"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(producto).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        producto = ProductoMincienciasService.actualizar(
            producto_minciencias_id=pk,
            nombre_producto=request.data.get("nombre_producto"),
            nomenclatura=request.data.get("nomenclatura"),
            peso=request.data.get("peso"),
            vigencia=request.data.get("vigencia"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(producto).data)

    @action(detail=False, methods=["get"], url_path="por-proyecto/(?P<proyecto_id>[^/.]+)")
    def por_proyecto(self, request, proyecto_id=None):
        productos = ProductoMincienciasService.listar_por_proyecto(proyecto_id)
        return Response(self.serializer_class(productos, many=True).data)