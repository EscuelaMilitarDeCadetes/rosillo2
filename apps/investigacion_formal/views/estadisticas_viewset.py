# apps/investigacion_formal/views/estadisticas_viewset.py — reemplazar archivo completo

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.investigacion_formal.services.estadisticas_service import EstadisticasService
from apps.investigacion_formal.permissions import ROLES_LECTURA_INVESTIGACION_FORMAL, combinar
from apps.usuarios.permissions import TieneAmbitoFormal


class EstadisticasViewSet(viewsets.ViewSet):

    def get_permissions(self):
        return [combinar(ROLES_LECTURA_INVESTIGACION_FORMAL), TieneAmbitoFormal()]

    @action(detail=False, methods=["get"], url_path="proyectos-por-anio")
    def proyectos_por_anio(self, request):
        filtros = self._parse_filtros(request)
        return Response(EstadisticasService.proyectos_por_anio(**filtros))

    @action(detail=False, methods=["get"], url_path="finalizados-vs-ejecucion")
    def finalizados_vs_ejecucion(self, request):
        filtros = self._parse_filtros(request)
        return Response(EstadisticasService.finalizados_vs_en_ejecucion_por_anio(**filtros))

    @action(detail=False, methods=["get"], url_path="ejecucion-presupuestal-por-anio")
    def ejecucion_presupuestal_por_anio(self, request):
        filtros = self._parse_filtros(request)
        return Response(EstadisticasService.ejecucion_presupuestal_promedio_por_anio(**filtros))

    @action(detail=False, methods=["get"], url_path="avance-ponderado-por-anio")
    def avance_ponderado_por_anio(self, request):
        filtros = self._parse_filtros(request)
        return Response(EstadisticasService.avance_ponderado_promedio_por_anio(**filtros))

    @action(detail=False, methods=["get"], url_path="produccion-por-anio")
    def produccion_por_anio(self, request):
        filtros = self._parse_filtros(request)
        return Response(EstadisticasService.produccion_por_anio(**filtros))

    @staticmethod
    def _parse_filtros(request):
        interno = request.query_params.get("interno")
        interno = interno.lower() == "true" if interno is not None else None
        facultad_id = request.query_params.get("facultad_id")
        grupo_id = request.query_params.get("grupo_id")
        return {
            "interno": interno,
            "facultad_id": int(facultad_id) if facultad_id else None,
            "grupo_id": int(grupo_id) if grupo_id else None,
        }