from apps.common.pagination import CommonPageNumberPagination
from apps.usuarios.permissions.es_cexterno import EsCExterno
from apps.usuarios.permissions.es_cinterno import EsCInterno
from apps.usuarios.permissions.es_decano import EsDecano
from apps.usuarios.permissions.es_facultad import EsFacultad
from apps.usuarios.permissions.es_gerente import EsGerente
from apps.usuarios.permissions.es_grupo import EsGrupo
from apps.usuarios.permissions.es_soporte import EsSoporte
from apps.usuarios.permissions.es_supervisor import EsSupervisor
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.contenttypes.models import ContentType
from apps.common.serializers import DocumentoFirmaSerializer
from apps.common.services.documento_firma_service import DocumentoFirmaService


def _resolver_objeto_generico(data):
    app_label = data.get("content_type_app_label")
    model = data.get("content_type_model")
    object_id = data.get("object_id")
    if not (app_label and model and object_id):
        return None
    content_type = ContentType.objects.get(app_label=app_label, model=model)
    return content_type.get_object_for_this_type(pk=object_id)


class DocumentoFirmaViewSet(viewsets.ViewSet):
    serializer_class = DocumentoFirmaSerializer
    pagination_class = CommonPageNumberPagination

    def get_permissions(self):
        acciones_autoservicio = ['list', 'retrieve', 'por_tipo_documento', 'ultima_version', 'por_objeto', 'habilitados_para_firma']
        if self.action in acciones_autoservicio:
            permission_classes = [IsAuthenticated]
        elif self.action in ['marcar_rechazado', 'rechazar']:
            permission_classes = [EsDecano | EsSupervisor | EsGerente]
        else:  # create
            permission_classes = [EsFacultad | EsGrupo | EsCInterno | EsCExterno]
        return [permission() for permission in permission_classes]

    def list(self, request):
        documentos = DocumentoFirmaService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(documentos, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        documento = DocumentoFirmaService.obtener(pk)
        return Response(self.serializer_class(documento).data)

    def create(self, request):
        objeto = _resolver_objeto_generico(request.data)
        archivo = request.FILES.get("archivo")
        kwargs = dict(
            tipo_documento_id=request.data.get("tipo_documento"),
            ip_creacion=request.META.get("REMOTE_ADDR", "0.0.0.0"),
            ejecutor=request.user,
            objeto=objeto,
            estado=request.data.get("estado", "BORRADOR"),
        )
        documento = (
            DocumentoFirmaService.crear_desde_archivo(archivo=archivo, **kwargs)
            if archivo is not None
            else DocumentoFirmaService.crear(ruta_documento=request.data.get("ruta_documento"), **kwargs)
        )
        return Response(self.serializer_class(documento).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        DocumentoFirmaService.eliminar(pk, ejecutor=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="habilitar-para-firma")
    def habilitar_para_firma(self, request, pk=None):
        documento = DocumentoFirmaService.habilitar_para_firma(pk, ejecutor=request.user)
        return Response(self.serializer_class(documento).data)

    @action(detail=True, methods=["post"], url_path="marcar-rechazado")
    def marcar_rechazado(self, request, pk=None):
        documento = DocumentoFirmaService.marcar_rechazado(pk, ejecutor=request.user)
        return Response(self.serializer_class(documento).data)

    @action(detail=False, methods=["get"], url_path="por-tipo-documento")
    def por_tipo_documento(self, request):
        tipo_documento_id = request.query_params.get("tipo_documento")
        documentos = DocumentoFirmaService.listar_por_tipo_documento(tipo_documento_id)
        return Response(self.serializer_class(documentos, many=True).data)

    @action(detail=False, methods=["get"], url_path="ultima-version")
    def ultima_version(self, request):
        tipo_documento_id = request.query_params.get("tipo_documento")
        documento = DocumentoFirmaService.obtener_ultima_version(tipo_documento_id)
        if documento is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(self.serializer_class(documento).data)

    @action(detail=False, methods=["get"], url_path="habilitados-para-firma")
    def habilitados_para_firma(self, request):
        documentos = DocumentoFirmaService.listar_habilitados_para_firma()
        return Response(self.serializer_class(documentos, many=True).data)

    @action(detail=False, methods=["get"], url_path="por-objeto")
    def por_objeto(self, request):
        objeto = _resolver_objeto_generico(request.query_params)
        if objeto is None:
            return Response(
                {"error": "Se requieren 'content_type_app_label', 'content_type_model' y 'object_id'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        documentos = DocumentoFirmaService.listar_por_objeto(objeto)
        return Response(self.serializer_class(documentos, many=True).data)