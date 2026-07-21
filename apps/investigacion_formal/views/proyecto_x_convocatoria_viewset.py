from apps.investigacion_formal.pagination import InvestigacionFormalPageNumberPagination
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.investigacion_formal.serializers.proyecto_x_convocatoria_serializer import (
    ProyectoXConvocatoriaSerializer,
)
from apps.investigacion_formal.services.proyecto_x_convocatoria_service import (
    ProyectoXConvocatoriaService,
)
from apps.usuarios.permissions import (
    EsFacultad, EsGrupo, EsCInterno, EsCExterno,
    EsAsesor, EsSupervisor, EsDecano, EsGerente,
)

ACCIONES_SOLO_CINTERNO_CEXTERNO = [
    "destroy", "habilitar_correccion", "deshabilitar_correccion", "finalizar_calificacion",
]


class ProyectoXConvocatoriaViewSet(viewsets.ViewSet):
    serializer_class = ProyectoXConvocatoriaSerializer
    pagination_class = InvestigacionFormalPageNumberPagination

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [EsFacultad | EsGrupo]
        elif self.action in ACCIONES_SOLO_CINTERNO_CEXTERNO:
            permission_classes = [EsCInterno | EsCExterno]
        else: #list, retrieve, por_proyecto, por_convocatoria, sin_calificar, calificados, por_facultad, por_grupos
            permission_classes = [
                EsFacultad | EsGrupo | EsCInterno | EsCExterno
                | EsAsesor | EsSupervisor | EsDecano | EsGerente
            ]
        return [permission() for permission in permission_classes]

    def list(self, request):
        registros = ProyectoXConvocatoriaService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(registros, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        registro = ProyectoXConvocatoriaService.obtener(pk)
        return Response(self.serializer_class(registro).data)

    def create(self, request):
        registro = ProyectoXConvocatoriaService.crear(
            convocatoria_id=request.data.get("convocatoria"),
            proyecto_id=request.data.get("proyecto"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(registro).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        ProyectoXConvocatoriaService.eliminar(pk, ejecutor=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["patch"], url_path="habilitar-correccion")
    def habilitar_correccion(self, request, pk=None):
        registro = ProyectoXConvocatoriaService.habilitar_correccion(pk, ejecutor=request.user)
        return Response(self.serializer_class(registro).data)

    @action(detail=True, methods=["patch"], url_path="deshabilitar-correccion")
    def deshabilitar_correccion(self, request, pk=None):
        registro = ProyectoXConvocatoriaService.deshabilitar_correccion(pk, ejecutor=request.user)
        return Response(self.serializer_class(registro).data)

    @action(detail=True, methods=["patch"], url_path="finalizar-calificacion")
    def finalizar_calificacion(self, request, pk=None):
        registro = ProyectoXConvocatoriaService.finalizar_calificacion(
            proyecto_x_convocatoria_id=pk,
            aprobado=request.data.get("aprobado"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(registro).data)

    @action(detail=False, methods=["get"], url_path="por-proyecto/(?P<proyecto_id>[^/.]+)")
    def por_proyecto(self, request, proyecto_id=None):
        registros = ProyectoXConvocatoriaService.listar_por_proyecto(proyecto_id)
        return Response(self.serializer_class(registros, many=True).data)

    @action(detail=False, methods=["get"], url_path="por-convocatoria/(?P<convocatoria_id>[^/.]+)")
    def por_convocatoria(self, request, convocatoria_id=None):
        registros = ProyectoXConvocatoriaService.listar_por_convocatoria(convocatoria_id)
        return Response(self.serializer_class(registros, many=True).data)

    @action(detail=False, methods=["get"], url_path="sin-calificar")
    def sin_calificar(self, request):
        registros = ProyectoXConvocatoriaService.listar_sin_calificar()
        return Response(self.serializer_class(registros, many=True).data)

    @action(detail=False, methods=["get"], url_path="calificados")
    def calificados(self, request):
        calificacion = request.query_params.get("calificacion")
        registros = ProyectoXConvocatoriaService.listar_calificados(calificacion=calificacion)
        return Response(self.serializer_class(registros, many=True).data)

    @action(detail=False, methods=["get"], url_path="por-facultad/(?P<facultad_id>[^/.]+)")
    def por_facultad(self, request, facultad_id=None):
        registros = ProyectoXConvocatoriaService.listar_por_facultad(facultad_id)
        return Response(self.serializer_class(registros, many=True).data)

    @action(detail=False, methods=["get"], url_path="por-grupo/(?P<grupo_id>[^/.]+)")
    def por_grupo(self, request, grupo_id=None):
        registros = ProyectoXConvocatoriaService.listar_por_grupo(grupo_id)
        return Response(self.serializer_class(registros, many=True).data)