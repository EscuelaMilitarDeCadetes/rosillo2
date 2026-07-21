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

from apps.investigacion_formal.serializers.tipo_calificacion_serializer import (
    TipoCalificacionSerializer,
)
from apps.investigacion_formal.services.tipo_calificacion_service import TipoCalificacionService
from apps.usuarios.permissions import EsSoporte


class TipoCalificacionViewSet(viewsets.ViewSet):
    serializer_class = TipoCalificacionSerializer
    pagination_class = InvestigacionFormalPageNumberPagination
    
    def get_permissions(self):
        if self.action in ["create", "update"]:
            permission_classes = [EsSoporte]
        else: #list, retrieve, evaluables
            permission_classes = [
                EsSoporte | EsFacultad | EsGrupo | EsCInterno | EsCExterno
                | EsAsesor | EsSupervisor | EsDecano | EsGerente
            ]
        return [permission() for permission in permission_classes]

    def list(self, request):
        fases = TipoCalificacionService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(fases, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        fase = TipoCalificacionService.obtener(pk)
        return Response(self.serializer_class(fase).data)

    def create(self, request):
        fase = TipoCalificacionService.crear(
            tipo_calificacion=request.data.get("tipo_calificacion"),
            descripcion=request.data.get("descripcion"),
            evaluacion=request.data.get("evaluacion"),
            orden_fase=request.data.get("ordenFase"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(fase).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        fase = TipoCalificacionService.actualizar(
            tipo_calificacion_id=pk,
            tipo_calificacion=request.data.get("tipo_calificacion"),
            descripcion=request.data.get("descripcion"),
            evaluacion=request.data.get("evaluacion"),
            orden_fase=request.data.get("ordenFase"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(fase).data)

    @action(detail=False, methods=["get"], url_path="evaluables")
    def evaluables(self, request):
        fases = TipoCalificacionService.listar_evaluables()
        return Response(self.serializer_class(fases, many=True).data)