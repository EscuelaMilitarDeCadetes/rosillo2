# apps/investigacion_formativa/views/instancia_etapa_viewset.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.investigacion_formativa.pagination import InvestigacionFormativaPageNumberPagination
from apps.investigacion_formativa.serializers.instancia_etapa_serializer import InstanciaEtapaSerializer
from apps.investigacion_formativa.services.instancia_etapa_service import InstanciaEtapaService
from apps.investigacion_formativa.permissions import (
    combinar,
    ROLES_LECTURA_INVESTIGACION_FORMATIVA,
    ROLES_GESTION_INSTANCIA_ETAPA,
)


class InstanciaEtapaViewSet(viewsets.ViewSet):
    serializer_class = InstanciaEtapaSerializer
    pagination_class = InvestigacionFormativaPageNumberPagination

    def get_permissions(self):
        if self.action in ["iniciar", "aprobar", "rechazar", "marcar_segunda_instancia"]:
            # Filtro amplio: cualquier rol que PODRIA llegar a ser responsable
            # de alguna etapa (Estudiante/Tutor/Jurado/Facultad/Decano/Soporte).
            # El chequeo fino de que el ejecutor coincida con el rol_responsable
            # de ESTA etapa concreta lo hace InstanciaEtapaService (ver
            # _validar_ejecutor_responsable / ejecutor_autorizado_para_etapa).
            return [combinar(ROLES_GESTION_INSTANCIA_ETAPA)]
        else:  # list, retrieve, por_proceso
            return [combinar(ROLES_LECTURA_INVESTIGACION_FORMATIVA)]

    def list(self, request):
        instancias = InstanciaEtapaService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(instancias, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        instancia = InstanciaEtapaService.obtener(pk)
        return Response(self.serializer_class(instancia).data)

    @action(detail=False, methods=["get"], url_path="por-proceso/(?P<proceso_id>[^/.]+)")
    def por_proceso(self, request, proceso_id=None):
        instancias = InstanciaEtapaService.listar_por_proceso(proceso_id)
        return Response(self.serializer_class(instancias, many=True).data)

    @action(detail=True, methods=["patch"], url_path="iniciar")
    def iniciar(self, request, pk=None):
        instancia = InstanciaEtapaService.iniciar(instancia_id=pk, ejecutor=request.user)
        return Response(self.serializer_class(instancia).data)

    @action(detail=True, methods=["patch"], url_path="aprobar")
    def aprobar(self, request, pk=None):
        instancia = InstanciaEtapaService.aprobar(instancia_id=pk, ejecutor=request.user)
        return Response(self.serializer_class(instancia).data)

    @action(detail=True, methods=["patch"], url_path="rechazar")
    def rechazar(self, request, pk=None):
        instancia = InstanciaEtapaService.rechazar(instancia_id=pk, ejecutor=request.user)
        return Response(self.serializer_class(instancia).data)

    @action(detail=True, methods=["patch"], url_path="segunda-instancia")
    def marcar_segunda_instancia(self, request, pk=None):
        instancia = InstanciaEtapaService.marcar_segunda_instancia(instancia_id=pk, ejecutor=request.user)
        return Response(self.serializer_class(instancia).data)