from apps.investigacion_formal.pagination import InvestigacionFormalPageNumberPagination
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.investigacion_formal.serializers.objetivo_x_punto_serializer import (
    ObjetivoXPuntoSerializer,
)
from apps.investigacion_formal.services.objetivo_x_punto_service import ObjetivoXPuntoService
from apps.usuarios.permissions import (
    EsFacultad, EsGrupo, EsCInterno, EsCExterno,
    EsAsesor, EsSupervisor, EsDecano, EsGerente,
)


class ObjetivoXPuntoViewSet(viewsets.ViewSet):
    serializer_class = ObjetivoXPuntoSerializer
    pagination_class = InvestigacionFormalPageNumberPagination

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [EsFacultad | EsGrupo | EsCInterno | EsCExterno]
        elif self.action in ["agregar_avance", "destroy"]:
            permission_classes = [EsCInterno | EsCExterno]
        else: #list, retrieve, por_proyecto, por objetivo
            permission_classes = [
                EsFacultad | EsGrupo | EsCInterno | EsCExterno
                | EsAsesor | EsSupervisor | EsDecano | EsGerente
            ]
        return [permission() for permission in permission_classes]

    def list(self, request):
        registros = ObjetivoXPuntoService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(registros, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        registro = ObjetivoXPuntoService.obtener(pk)
        return Response(self.serializer_class(registro).data)

    def create(self, request):
        registro = ObjetivoXPuntoService.crear(
            objetivo_id=request.data.get("objetivo"),
            control=request.data.get("control"),
            peso=request.data.get("peso"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(registro).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="agregar-avance/(?P<punto_control_id>[^/.]+)")
    def agregar_avance(self, request, punto_control_id=None):
        registro = ObjetivoXPuntoService.agregar_avance(
            punto_control_id=punto_control_id,
            descripcion_avance=request.data.get("descripcion_avance"),
            avance=request.data.get("avance"),
            mes_avance=request.data.get("mes_avance"),
            anio_avance=request.data.get("anio_avance"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(registro).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        ObjetivoXPuntoService.eliminar(pk, ejecutor=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"], url_path="por-proyecto/(?P<proyecto_id>[^/.]+)")
    def por_proyecto(self, request, proyecto_id=None):
        solo_activos = request.query_params.get("solo_activos", "true").lower() != "false"
        registros = ObjetivoXPuntoService.listar_por_proyecto(proyecto_id, solo_activos=solo_activos)
        return Response(self.serializer_class(registros, many=True).data)

    @action(detail=False, methods=["get"], url_path="por-objetivo/(?P<objetivo_id>[^/.]+)")
    def por_objetivo(self, request, objetivo_id=None):
        solo_activos = request.query_params.get("solo_activos", "true").lower() != "false"
        registros = ObjetivoXPuntoService.listar_por_objetivo(objetivo_id, solo_activos=solo_activos)
        return Response(self.serializer_class(registros, many=True).data)