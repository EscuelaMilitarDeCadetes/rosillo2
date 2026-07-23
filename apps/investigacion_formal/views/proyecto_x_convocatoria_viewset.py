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
from apps.investigacion_formal.permissions import (
    ROLES_LECTURA_INVESTIGACION_FORMAL, ROLES_ESCRITURA_GESTION,
    ROLES_CREACION_PROYECTO, combinar,
)
from django.http import HttpResponse
from apps.investigacion_formal.services.exportacion_service import ExportacionService
from apps.investigacion_formal.selectors.proyecto_x_convocatoria_selector import (
    ProyectoXConvocatoriaSelector,
)

ACCIONES_SOLO_CINTERNO_CEXTERNO = [
    "destroy", "habilitar_correccion", "deshabilitar_correccion", "finalizar_calificacion",
]


class ProyectoXConvocatoriaViewSet(viewsets.ViewSet):
    serializer_class = ProyectoXConvocatoriaSerializer
    pagination_class = InvestigacionFormalPageNumberPagination

    def get_permissions(self):
        if self.action == "create":
            return [combinar(ROLES_CREACION_PROYECTO)]   # antes: [EsFacultad | EsGrupo] inline
        elif self.action in ACCIONES_SOLO_CINTERNO_CEXTERNO:
            return [combinar(ROLES_ESCRITURA_GESTION)]
        else:  # list, retrieve, por_proyecto, por_convocatoria, sin_calificar, calificados, por_facultad, por_grupos
            return [combinar(ROLES_LECTURA_INVESTIGACION_FORMAL)]

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
    
    @action(detail=False, methods=["get"], url_path="buscar")
    def buscar(self, request):
        filtros = dict(
            convocatoria=request.query_params.get("convocatoria"),
            codigo=request.query_params.get("codigo"),
            titulo=request.query_params.get("titulo"),
            responsable=request.query_params.get("responsable"),
            calificacion=request.query_params.get("calificacion"),
        )
        for campo_booleano in ("financiado", "alianza", "interno", "gruplac", "estado"):
            valor = request.query_params.get(campo_booleano)
            filtros[campo_booleano] = (
                None if valor is None else valor.lower() == "true"
            )
        for campo_anio in ("anio_inicio", "anio_fin"):
            valor = request.query_params.get(campo_anio)
            filtros[campo_anio] = int(valor) if valor else None

        resultados = ProyectoXConvocatoriaService.buscar_con_filtros(**filtros)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(resultados, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def _filtros_desde_query_params(self, request):
        """Mismos parámetros de buscar_con_filtros (Hallazgo C), vía querystring."""
        qp = request.query_params
        return dict(
            convocatoria=qp.get("convocatoria"),
            codigo=qp.get("codigo"),
            titulo=qp.get("titulo"),
            financiado=(qp.get("financiado") == "true") if "financiado" in qp else None,
            alianza=(qp.get("alianza") == "true") if "alianza" in qp else None,
            responsable=qp.get("responsable"),
            calificacion=qp.get("calificacion"),
            anio_inicio=qp.get("anio_inicio"),
            anio_fin=qp.get("anio_fin"),
            interno=(qp.get("interno") == "true") if "interno" in qp else None,
            gruplac=(qp.get("gruplac") == "true") if "gruplac" in qp else None,
            estado=qp.get("estado"),
        )

    @action(detail=False, methods=["get"], url_path="export/excel")
    def export_excel(self, request):
        filtros = self._filtros_desde_query_params(request)
        queryset = ProyectoXConvocatoriaSelector.buscar_con_filtros(**filtros)
        buffer = ExportacionService.exportar_excel(queryset)
        response = HttpResponse(
            buffer.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = "attachment; filename=proyectos.xlsx"
        return response

    @action(detail=False, methods=["get"], url_path="export/pdf")
    def export_pdf(self, request):
        filtros = self._filtros_desde_query_params(request)
        queryset = ProyectoXConvocatoriaSelector.buscar_con_filtros(**filtros)
        buffer = ExportacionService.exportar_pdf(queryset)
        response = HttpResponse(buffer.read(), content_type="application/pdf")
        response["Content-Disposition"] = "attachment; filename=proyectos.pdf"
        return response    