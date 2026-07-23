from apps.investigacion_formal.models import ProyectoXConvocatoria


class ProyectoXConvocatoriaSelector:

    @staticmethod
    def listar():
        return ProyectoXConvocatoria.objects.select_related('convocatoria', 'proyecto').all()

    @staticmethod
    def obtener(proyecto_x_convocatoria_id):
        return (
            ProyectoXConvocatoria.objects
            .select_related('convocatoria', 'proyecto')
            .get(pk=proyecto_x_convocatoria_id)
        )

    @staticmethod
    def buscar(proyecto_x_convocatoria_id):
        return (
            ProyectoXConvocatoria.objects
            .select_related('convocatoria', 'proyecto')
            .filter(pk=proyecto_x_convocatoria_id)
            .first()
        )

    @staticmethod
    def existe(proyecto_x_convocatoria_id):
        return ProyectoXConvocatoria.objects.filter(pk=proyecto_x_convocatoria_id).exists()

    @staticmethod
    def listar_por_proyecto(proyecto_id):
        return (
            ProyectoXConvocatoria.objects
            .select_related('convocatoria')
            .filter(proyecto_id=proyecto_id)
        )

    @staticmethod
    def listar_por_convocatoria(convocatoria_id):
        return (
            ProyectoXConvocatoria.objects
            .select_related('proyecto')
            .filter(convocatoria_id=convocatoria_id)
        )

    @staticmethod
    def listar_por_usuario(usuario_id):
        return (
            ProyectoXConvocatoria.objects
            .select_related('convocatoria', 'proyecto')
            .filter(proyecto__usuario_id=usuario_id)
        )

    @staticmethod
    def obtener_por_proyecto_y_convocatoria(proyecto_id, convocatoria_id):
        return (
            ProyectoXConvocatoria.objects
            .filter(proyecto_id=proyecto_id, convocatoria_id=convocatoria_id)
            .first()
        )

    @staticmethod
    def existe_vinculo(proyecto_id, convocatoria_id, excluir_id=None):
        qs = ProyectoXConvocatoria.objects.filter(
            proyecto_id=proyecto_id, convocatoria_id=convocatoria_id
        )
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_sin_calificar():
        return (
            ProyectoXConvocatoria.objects
            .select_related('convocatoria', 'proyecto')
            .filter(estado_finalizado_calificacion=False)
        )

    @staticmethod
    def listar_calificados(calificacion=None):
        """calificacion opcional: 'APROBADO' | 'NO_APROBADO'."""
        qs = (
            ProyectoXConvocatoria.objects
            .select_related('convocatoria', 'proyecto')
            .filter(estado_finalizado_calificacion=True)
        )
        if calificacion is not None:
            qs = qs.filter(calificacion_ultimo_filtro_calificacion=calificacion)
        return qs

    @staticmethod
    def listar_habilitados_correccion_documento():
        return (
            ProyectoXConvocatoria.objects
            .select_related('convocatoria', 'proyecto')
            .filter(modificacion_documento_proyecto=True)
        )

    @staticmethod
    def listar_filtros_fase_distintos():
        """Réplica de listarFasesCalificadas / getAllPhases: valores distintos de la fase actual."""
        return (
            ProyectoXConvocatoria.objects
            .exclude(ultimo_filtro_calificacion__isnull=True)
            .exclude(ultimo_filtro_calificacion='')
            .order_by('ultimo_filtro_calificacion')
            .values_list('ultimo_filtro_calificacion', flat=True)
            .distinct()
        )

    @staticmethod
    def listar_filtros_calificacion_distintos():
        """Réplica de getAllQualificationFilter / listarFiltrosUltimaCalificacion."""
        return (
            ProyectoXConvocatoria.objects
            .exclude(calificacion_ultimo_filtro_calificacion__isnull=True)
            .exclude(calificacion_ultimo_filtro_calificacion='')
            .order_by('calificacion_ultimo_filtro_calificacion')
            .values_list('calificacion_ultimo_filtro_calificacion', flat=True)
            .distinct()
        )

    @staticmethod
    def listar_por_facultad(facultad_id):
        return (
            ProyectoXConvocatoria.objects
            .select_related('convocatoria', 'proyecto')
            .filter(
                proyecto__usuario__asignaciones__estado=True,
                proyecto__usuario__asignaciones__persona__personaxgrupo__estado=True,
                proyecto__usuario__asignaciones__persona__personaxgrupo__facultad_id=facultad_id,
            )
            .distinct()
        )

    @staticmethod
    def listar_por_grupo(grupo_id):
        return (
            ProyectoXConvocatoria.objects
            .select_related('convocatoria', 'proyecto')
            .filter(
                proyecto__usuario__asignaciones__estado=True,
                proyecto__usuario__asignaciones__persona__personaxgrupo__estado=True,
                proyecto__usuario__asignaciones__persona__personaxgrupo__grupo_id=grupo_id,
            )
            .distinct()
        )

    @staticmethod
    def buscar_con_filtros(convocatoria=None, codigo=None, titulo=None,
                            financiado=None, alianza=None, responsable=None,
                            calificacion=None, anio_inicio=None, anio_fin=None,
                            interno=None, gruplac=None, estado=None):
        """
        Réplica de ProyectoXConvocatoriaSpecification.conFiltros() del
        Thymeleaf original: todos los parámetros son opcionales y
        combinables (AND); solo se añade un filtro si su valor no es None
        (o no vacío, para los de texto), igual que el original.
        """
        from django.db.models import Q
        qs = ProyectoXConvocatoria.objects.select_related(
            'proyecto', 'convocatoria', 'proyecto__usuario__persona'
        ).all()
        filtros = Q()
        if convocatoria:
            filtros &= Q(convocatoria__nombre_convocatoria__icontains=convocatoria)
        if codigo:
            filtros &= Q(proyecto__codigo__icontains=codigo)
        if titulo:
            filtros &= Q(proyecto__titulo__icontains=titulo)
        if financiado is not None:
            filtros &= Q(proyecto__financiado=financiado)
        if alianza is not None:
            filtros &= Q(proyecto__alianza=alianza)
        if responsable:
            filtros &= (
                # CORREGIDO: Usuario no tiene campo 'persona' directo, solo la
                # relación inversa 'asignaciones' (UsuarioXPersona.usuario,
                # related_name='asignaciones'); y Persona.nombre/apellido son
                # singulares, no 'nombres'/'apellidos'.
                Q(proyecto__usuario__asignaciones__estado=True,
                  proyecto__usuario__asignaciones__persona__nombre__icontains=responsable)
                | Q(proyecto__usuario__asignaciones__estado=True,
                    proyecto__usuario__asignaciones__persona__apellido__icontains=responsable)
            )
        if calificacion:
            filtros &= Q(calificacion_ultimo_filtro_calificacion=calificacion)
        if anio_inicio:
            filtros &= Q(proyecto__fecha_inicio__year=anio_inicio)
        if anio_fin:
            filtros &= Q(proyecto__fecha_fin__year=anio_fin)
        if interno is not None:
            filtros &= Q(convocatoria__interno=interno)
        if gruplac is not None:
            filtros &= Q(proyecto__gruplac=gruplac)
        if estado is not None:
            filtros &= Q(estado=estado)
        return qs.filter(filtros).order_by('-proyecto__fecha_inicio')