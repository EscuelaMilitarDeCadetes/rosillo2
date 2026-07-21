from apps.investigacion_formal.pagination import InvestigacionFormalPageNumberPagination
from rest_framework import viewsets, status
from rest_framework.response import Response

from apps.investigacion_formal.serializers.punto_control_serializer import PuntoControlSerializer
from apps.investigacion_formal.services.punto_control_service import PuntoControlService
from apps.usuarios.permissions import (
    EsFacultad, EsGrupo, EsCInterno, EsCExterno,
    EsAsesor, EsSupervisor, EsDecano, EsGerente,
)


class PuntoControlViewSet(viewsets.ViewSet):
    serializer_class = PuntoControlSerializer
    pagination_class = InvestigacionFormalPageNumberPagination

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [EsFacultad | EsGrupo | EsCInterno | EsCExterno]
        elif self.action in ["update", "destroy"]:
            permission_classes = [EsCInterno | EsCExterno]
        else: #list, retrieve
            permission_classes = [
                EsFacultad | EsGrupo | EsCInterno | EsCExterno
                | EsAsesor | EsSupervisor | EsDecano | EsGerente
            ]
        return [permission() for permission in permission_classes]

    def list(self, request):
        puntos = PuntoControlService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(puntos, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        punto = PuntoControlService.obtener(pk)
        return Response(self.serializer_class(punto).data)

    def create(self, request):
        punto = PuntoControlService.crear(
            control=request.data.get("control"),
            peso=request.data.get("peso"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(punto).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        punto = PuntoControlService.actualizar(
            punto_control_id=pk,
            control=request.data.get("control"),
            peso=request.data.get("peso"),
            ejecutor=request.user,
        )
        return Response(self.serializer_class(punto).data)

    def destroy(self, request, pk=None):
        PuntoControlService.eliminar(pk, ejecutor=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)