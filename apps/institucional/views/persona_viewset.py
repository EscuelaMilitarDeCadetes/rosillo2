from apps.institucional.pagination import InstitucionalPageNumberPagination
from apps.usuarios.permissions.es_decano import EsDecano
from rest_framework import viewsets
from rest_framework.response import Response
from apps.institucional.serializers import PersonaSerializer
from apps.institucional.services.persona_service import PersonaService
from apps.usuarios.permissions.es_soporte import EsSoporte
from apps.usuarios.permissions.es_supervisor import EsSupervisor
from apps.usuarios.permissions.es_asesor import EsAsesor
from apps.usuarios.permissions.es_facultad import EsFacultad
from apps.usuarios.permissions.es_grupo import EsGrupo
from apps.usuarios.permissions.es_cinterno import EsCInterno
from apps.usuarios.permissions.es_cexterno import EsCExterno


class PersonaViewSet(viewsets.ViewSet):
    serializer_class = PersonaSerializer
    pagination_class = InstitucionalPageNumberPagination

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [
                EsSoporte | EsSupervisor | EsAsesor | EsFacultad | EsGrupo | EsCInterno | EsCExterno | EsDecano
            ]
        else:
            permission_classes = [EsSoporte]
        return [permission() for permission in permission_classes]

    def list(self, request):
        personas = PersonaService.listar()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(personas, request, view=self)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        persona = PersonaService.obtener(pk)
        serializer = self.serializer_class(persona)
        return Response(serializer.data)

    def create(self, request):
        persona = PersonaService.crear(
            grado_id=request.data.get("grado"),
            nombre=request.data.get("nombre"),
            apellido=request.data.get("apellido"),
            documento=request.data.get("documento"),
            celular=request.data.get("celular"),
            correo=request.data.get("correo"),
            cvlac=request.data.get("cvlac"),
            ejecutor=request.user,
        )
        serializer = self.serializer_class(persona)
        return Response(serializer.data, status=201)

    def update(self, request, pk=None):
        persona = PersonaService.actualizar(
            persona_id=pk,
            ejecutor=request.user,
            grado_id=request.data.get("grado"),
            nombre=request.data.get("nombre"),
            apellido=request.data.get("apellido"),
            documento=request.data.get("documento"),
            celular=request.data.get("celular"),
            correo=request.data.get("correo"),
            cvlac=request.data.get("cvlac"),
        )
        serializer = self.serializer_class(persona)
        return Response(serializer.data)