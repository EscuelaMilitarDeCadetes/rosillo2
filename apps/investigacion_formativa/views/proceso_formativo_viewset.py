from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.investigacion_formativa.pagination import InvestigacionFormativaPageNumberPagination
from apps.investigacion_formativa.serializers.proceso_formativo_serializer import (
    ProcesoFormativoSerializer,
)
from apps.investigacion_formativa.services.proceso_formativo_service import (
    ProcesoFormativoService,
)
from apps.investigacion_formativa.permissions import (
    ROLES_LECTURA_INVESTIGACION_FORMATIVA, ROLES_ESCRITURA_GESTION,
    ROLES_CALIFICACION_PROCESO, combinar,
)
from apps.investigacion_formativa.services.avance_service import AvanceService
from apps.investigacion_formativa.serializers.avance_serializer import AvanceProcesoFormativoSerializer


class ProcesoFormativoViewSet(viewsets.ViewSet):
    serializer_class = ProcesoFormativoSerializer
    pagination_class = InvestigacionFormativaPageNumberPagination

    def get_permissions(self):
        if self.action in ["create", "update", "activar_segunda_instancia", "destroy"]:
            return [combinar(ROLES_ESCRITURA_GESTION)]
        elif self.action == "calificar":
            return [combinar(ROLES_CALIFICACION_PROCESO)]
        else:  # list, retrieve, activos, por_persona
            return [combinar(ROLES_LECTURA_INVESTIGACION_FORMATIVA)]

    def list(self, request):
        procesos = ProcesoFormativoService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(procesos, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        proceso = ProcesoFormativoService.obtener(pk)
        return Response(self.serializer_class(proceso).data)

    def create(self, request):
        proceso = ProcesoFormativoService.crear(
            flujo_version_id=request.data.get("flujo_version"),
            titulo=request.data.get("titulo"),
            observacion=request.data.get("observacion"),
            fecha_inicio=request.data.get("fecha_inicio"),
            fecha_fin=request.data.get("fecha_fin"),
            ejecutor=request.user,
            idea_id=request.data.get("idea"),
            entidad_externa_id=request.data.get("entidad_externa"),
            palabras_clave=request.data.get("palabras_clave"),
            requiere_sustentacion=request.data.get("requiere_sustentacion", False),
            permite_segunda_instancia=request.data.get("permite_segunda_instancia", False),
        )
        return Response(self.serializer_class(proceso).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        proceso = ProcesoFormativoService.actualizar(
            proceso_id=pk,
            titulo=request.data.get("titulo"),
            observacion=request.data.get("observacion"),
            fecha_inicio=request.data.get("fecha_inicio"),
            fecha_fin=request.data.get("fecha_fin"),
            ejecutor=request.user,
            palabras_clave=request.data.get("palabras_clave"),
        )
        return Response(self.serializer_class(proceso).data)

    def destroy(self, request, pk=None):
        ProcesoFormativoService.eliminar(pk, ejecutor=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def calificar(self, request, pk=None):
        proceso = ProcesoFormativoService.calificar(
            proceso_id=pk,
            aprobado=request.data.get("aprobado"),
            ejecutor=request.user,
            nota_final=request.data.get("nota_final"),
        )
        return Response(self.serializer_class(proceso).data)

    @action(detail=True, methods=["post"], url_path="activar-segunda-instancia")
    def activar_segunda_instancia(self, request, pk=None):
        proceso = ProcesoFormativoService.activar_segunda_instancia(pk, ejecutor=request.user)
        return Response(self.serializer_class(proceso).data)

    @action(detail=False, methods=["get"])
    def activos(self, request):
        procesos = ProcesoFormativoService.listar_activos()
        return Response(self.serializer_class(procesos, many=True).data)

    @action(detail=False, methods=["get"], url_path="por-persona/(?P<persona_id>[^/.]+)")
    def por_persona(self, request, persona_id=None):
        procesos = ProcesoFormativoService.listar_por_persona(persona_id)
        return Response(self.serializer_class(procesos, many=True).data)
    
    @action(detail=True, methods=["get"])
    def avance(self, request, pk=None):
        resumen = AvanceService.obtener_resumen(pk)
        return Response(AvanceProcesoFormativoSerializer(resumen).data)