from apps.investigacion_formal.pagination import InvestigacionFormalPageNumberPagination
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.investigacion_formal.serializers.investigador_x_proyecto_serializer import (
    InvestigadorXProyectoSerializer,
)
from apps.investigacion_formal.services.investigador_x_proyecto_service import (
    InvestigadorXProyectoService,
)
from apps.usuarios.permissions import (
    EsFacultad, EsGrupo, EsCInterno, EsCExterno,
    EsAsesor, EsSupervisor, EsDecano, EsGerente,
)


class InvestigadorXProyectoViewSet(viewsets.ViewSet):
    serializer_class = InvestigadorXProyectoSerializer
    pagination_class = InvestigacionFormalPageNumberPagination

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [EsFacultad | EsGrupo | EsCInterno | EsCExterno]
        elif self.action in ["update", "destroy"]:
            permission_classes = [EsCInterno | EsCExterno]
        else: #list, retrieve, por_proyecto
            permission_classes = [
                EsFacultad | EsGrupo | EsCInterno | EsCExterno
                | EsAsesor | EsSupervisor | EsDecano | EsGerente
            ]
        return [permission() for permission in permission_classes]

    def list(self, request):
        investigadores = InvestigadorXProyectoService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(investigadores, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        investigador = InvestigadorXProyectoService.obtener(pk)
        return Response(self.serializer_class(investigador).data)

    def create(self, request):
        investigador = InvestigadorXProyectoService.crear(
            rol_investigador_id=request.data.get("rol_investigador"),
            proyecto_id=request.data.get("proyecto"),
            persona_x_grupo_id=request.data.get("persona_x_grupo"),
            ejecutor=request.user,
            orcid=request.data.get("orcid"),
        )
        return Response(self.serializer_class(investigador).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        investigador = InvestigadorXProyectoService.actualizar(
            investigador_x_proyecto_id=pk,
            ejecutor=request.user,
            rol_investigador_id=request.data.get("rol_investigador"),
            orcid=request.data.get("orcid"),
        )
        return Response(self.serializer_class(investigador).data)

    def destroy(self, request, pk=None):
        InvestigadorXProyectoService.eliminar(pk, ejecutor=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"], url_path="por-proyecto/(?P<proyecto_id>[^/.]+)")
    def por_proyecto(self, request, proyecto_id=None):
        solo_activos = request.query_params.get("solo_activos", "true").lower() != "false"
        investigadores = InvestigadorXProyectoService.listar_por_proyecto(
            proyecto_id, solo_activos=solo_activos
        )
        return Response(self.serializer_class(investigadores, many=True).data)