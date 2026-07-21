# apps/investigacion_formal/views/grupo_minciencias_viewset.py
from apps.investigacion_formal.pagination import InvestigacionFormalPageNumberPagination
from rest_framework import viewsets, status
from rest_framework.response import Response
from apps.investigacion_formal.serializers.grupo_minciencias_serializer import (
    GrupoMincienciasSerializer,
)
from apps.investigacion_formal.services.grupo_minciencias_service import GrupoMincienciasService
from apps.usuarios.permissions import (
    EsSoporte, EsFacultad, EsGrupo, EsCInterno, EsCExterno, EsAsesor, EsSupervisor, EsDecano, EsGerente,
)


class GrupoMincienciasViewSet(viewsets.ViewSet):
    serializer_class = GrupoMincienciasSerializer
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
        grupos = GrupoMincienciasService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(grupos, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        grupo = GrupoMincienciasService.obtener(pk)
        return Response(self.serializer_class(grupo).data)

    def create(self, request):
        grupo = GrupoMincienciasService.crear(
            nombre_grupo_minciencias=request.data.get("nombre_grupo_minciencias"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(grupo).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        grupo = GrupoMincienciasService.actualizar(
            grupo_minciencias_id=pk,
            nombre_grupo_minciencias=request.data.get("nombre_grupo_minciencias"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(grupo).data)