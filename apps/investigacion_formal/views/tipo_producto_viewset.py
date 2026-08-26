from apps.investigacion_formal.pagination import InvestigacionFormalPageNumberPagination
from apps.usuarios.permissions.tiene_ambito import TieneAmbitoFormal
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.investigacion_formal.serializers.tipo_producto_serializer import TipoProductoSerializer
from apps.investigacion_formal.services.tipo_producto_service import TipoProductoService
from apps.investigacion_formal.permissions import ROLES_LECTURA_CATALOGOS, combinar
from apps.usuarios.permissions import EsSoporte

from django.http import HttpResponse
from apps.investigacion_formal.services.exportacion_service import ExportacionService


class TipoProductoViewSet(viewsets.ViewSet):
    serializer_class = TipoProductoSerializer
    pagination_class = InvestigacionFormalPageNumberPagination
    
    def get_permissions(self):
        if self.action in ["create", "update"]:
            return [EsSoporte(), TieneAmbitoFormal()]
        else:  # list, retrieve, aplicables, export_excel, export_pdf
            return [combinar(ROLES_LECTURA_CATALOGOS), TieneAmbitoFormal()]

    def list(self, request):
        tipos = TipoProductoService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(tipos, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        tipo = TipoProductoService.obtener(pk)
        return Response(self.serializer_class(tipo).data)

    def create(self, request):
        tipo = TipoProductoService.crear(
            tipo_producto=request.data.get("tipo_producto"),
            aplica=request.data.get("aplica"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(tipo).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        tipo = TipoProductoService.actualizar(
            tipo_producto_id=pk,
            tipo_producto=request.data.get("tipo_producto"),
            aplica=request.data.get("aplica"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(tipo).data)

    @action(detail=False, methods=["get"], url_path="aplicables")
    def aplicables(self, request):
        tipos = TipoProductoService.listar_aplicables()
        return Response(self.serializer_class(tipos, many=True).data)
    
    @action(detail=False, methods=["get"], url_path="export/excel")
    def export_excel(self, request):
        tipos = TipoProductoService.listar()
        buffer = ExportacionService.exportar_excel_tipos_producto(tipos)
        response = HttpResponse(
            buffer.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = "attachment; filename=tipos_producto.xlsx"
        return response

    @action(detail=False, methods=["get"], url_path="export/pdf")
    def export_pdf(self, request):
        tipos = TipoProductoService.listar()
        buffer = ExportacionService.exportar_pdf_tipos_producto(tipos)
        response = HttpResponse(buffer.read(), content_type="application/pdf")
        response["Content-Disposition"] = "attachment; filename=tipos_producto.pdf"
        return response