from apps.investigacion_formativa.models import ProcesoFormativo


class ProcesoFormativoSelector:

    @staticmethod
    def listar():
        return (
            ProcesoFormativo.objects
            .select_related('idea', 'flujo_version', 'flujo_version__modalidad', 'entidad_externa')
            .all()
        )

    @staticmethod
    def obtener(proceso_id):
        return (
            ProcesoFormativo.objects
            .select_related('idea', 'flujo_version', 'flujo_version__modalidad', 'entidad_externa')
            .get(pk=proceso_id)
        )

    @staticmethod
    def buscar(proceso_id):
        return (
            ProcesoFormativo.objects
            .select_related('idea', 'flujo_version', 'flujo_version__modalidad', 'entidad_externa')
            .filter(pk=proceso_id)
            .first()
        )

    @staticmethod
    def existe(proceso_id):
        return ProcesoFormativo.objects.filter(pk=proceso_id).exists()

    @staticmethod
    def obtener_por_titulo(titulo):
        return ProcesoFormativo.objects.filter(titulo__iexact=titulo).first()

    @staticmethod
    def existe_titulo(titulo, excluir_id=None):
        qs = ProcesoFormativo.objects.filter(titulo__iexact=titulo)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_activos():
        return (
            ProcesoFormativo.objects
            .select_related('flujo_version', 'flujo_version__modalidad')
            .filter(activo=True)
        )

    @staticmethod
    def listar_por_idea(idea_id):
        return ProcesoFormativo.objects.filter(idea_id=idea_id)

    @staticmethod
    def listar_por_flujo_version(flujo_version_id):
        return (
            ProcesoFormativo.objects
            .select_related('flujo_version')
            .filter(flujo_version_id=flujo_version_id)
        )

    @staticmethod
    def listar_por_modalidad(modalidad_id):
        return (
            ProcesoFormativo.objects
            .select_related('flujo_version')
            .filter(flujo_version__modalidad_id=modalidad_id)
        )

    @staticmethod
    def listar_por_facultad(facultad_id):
        """Vía flujo_version -> modalidad -> ModalidadXFacultad -> facultad."""
        return (
            ProcesoFormativo.objects
            .select_related('flujo_version', 'flujo_version__modalidad')
            .filter(flujo_version__modalidad__modalidadxfacultad__facultad_id=facultad_id)
            .distinct()
        )

    @staticmethod
    def listar_por_entidad_externa(entidad_externa_id):
        return ProcesoFormativo.objects.filter(entidad_externa_id=entidad_externa_id)

    @staticmethod
    def listar_por_estado_general(estado_general):
        return ProcesoFormativo.objects.filter(estado_general__iexact=estado_general)

    @staticmethod
    def listar_aprobados():
        return (
            ProcesoFormativo.objects
            .select_related('flujo_version__modalidad')
            .filter(aprobado=True)
        )

    @staticmethod
    def listar_no_aprobados():
        return (
            ProcesoFormativo.objects
            .select_related('flujo_version__modalidad')
            .filter(aprobado=False)
        )

    @staticmethod
    def listar_pendientes_calificacion():
        return ProcesoFormativo.objects.filter(aprobado__isnull=True)

    @staticmethod
    def listar_que_requieren_sustentacion():
        return ProcesoFormativo.objects.filter(requiere_sustentacion=True)

    @staticmethod
    def listar_que_permiten_segunda_instancia():
        return ProcesoFormativo.objects.filter(permite_segunda_instancia=True)

    @staticmethod
    def listar_con_segunda_instancia_consumida():
        return ProcesoFormativo.objects.filter(segunda_instancia_consumida=True)

    @staticmethod
    def listar_por_persona(persona_id, solo_activos=True):
        """Procesos donde la persona participa (estudiante, tutor, jurado, etc.)."""
        qs = ProcesoFormativo.objects.filter(participantes__persona_id=persona_id)
        if solo_activos:
            qs = qs.filter(participantes__activo=True)
        return qs.distinct()

    @staticmethod
    def listar_anios_inicio_distintos():
        return (
            ProcesoFormativo.objects
            .filter(fecha_inicio__isnull=False)
            .dates('fecha_inicio', 'year', order='DESC')
        )

    @staticmethod
    def listar_anios_fin_distintos():
        return (
            ProcesoFormativo.objects
            .filter(fecha_fin__isnull=False)
            .dates('fecha_fin', 'year', order='DESC')
        )

    @staticmethod
    def buscar_con_filtros(modalidad=None, facultad=None, estado_general=None,
                            aprobado=None, anio_inicio=None, anio_fin=None,
                            persona=None, requiere_sustentacion=None):
        """
        Filtros encadenados y combinables (AND) sobre ProcesoFormativo, con el
        mismo criterio de ProyectoXConvocatoriaSelector.buscar_con_filtros() de
        investigacion_formal (Hallazgo C de esa auditoría): solo se añade un
        filtro si su valor no es None. No hay precedente de esto en el
        Thymeleaf original porque investigacion_formativa es un módulo nuevo
        de esta migración (no existía en el sistema legado), así que este
        método es la primera implementación, no una réplica.

        - modalidad / facultad: se filtran vía flujo_version (igual que
          listar_por_modalidad / listar_por_facultad).
        - facultad usa .distinct() porque una modalidad puede estar
          disponible en varias facultades (ModalidadXFacultad).
        - persona usa .distinct() por la misma razón que listar_por_persona:
          una persona puede tener más de un registro en 'participantes'
          si además de estudiante fue, por ejemplo, jurado en otra etapa.
        """
        from django.db.models import Q

        qs = ProcesoFormativo.objects.select_related(
            'flujo_version', 'flujo_version__modalidad', 'idea', 'entidad_externa'
        ).all()

        filtros = Q()

        if modalidad:
            filtros &= Q(flujo_version__modalidad_id=modalidad)
        if estado_general:
            filtros &= Q(estado_general__iexact=estado_general)
        if aprobado is not None:
            filtros &= Q(aprobado=aprobado)
        if anio_inicio:
            filtros &= Q(fecha_inicio__year=anio_inicio)
        if anio_fin:
            filtros &= Q(fecha_fin__year=anio_fin)
        if requiere_sustentacion is not None:
            filtros &= Q(requiere_sustentacion=requiere_sustentacion)

        qs = qs.filter(filtros)

        if facultad:
            qs = qs.filter(
                flujo_version__modalidad__modalidadxfacultad__facultad_id=facultad
            )
        if persona:
            qs = qs.filter(participantes__persona_id=persona)
        if facultad or persona:
            qs = qs.distinct()

        return qs.order_by('-fecha_inicio')