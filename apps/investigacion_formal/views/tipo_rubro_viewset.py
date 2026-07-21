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
from rest_framework.response import Response

from apps.investigacion_formal.serializers.tipo_rubro_serializer import TipoRubroSerializer
from apps.investigacion_formal.services.tipo_rubro_service import TipoRubroService
from apps.usuarios.permissions import EsSoporte


class TipoRubroViewSet(viewsets.ViewSet):
    serializer_class = TipoRubroSerializer
    pagination_class = InvestigacionFormalPageNumberPagination
    
    def get_permissions(self):
        if self.action in ["create", "update"]:
            permission_classes = [EsSoporte]
        else: #list, retrieve
            permission_classes = [
                EsSoporte | EsFacultad | EsGrupo | EsCInterno | EsCExterno
                | EsAsesor | EsSupervisor | EsDecano | EsGerente
            ]
        return [permission() for permission in permission_classes]

    def list(self, request):
        rubros = TipoRubroService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(rubros, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        rubro = TipoRubroService.obtener(pk)
        return Response(self.serializer_class(rubro).data)

    def create(self, request):
        rubro = TipoRubroService.crear(
            nombre_rubro=request.data.get("nombre_rubro"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(rubro).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        rubro = TipoRubroService.actualizar(
            tipo_rubro_id=pk,
            nombre_rubro=request.data.get("nombre_rubro"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(rubro).data)