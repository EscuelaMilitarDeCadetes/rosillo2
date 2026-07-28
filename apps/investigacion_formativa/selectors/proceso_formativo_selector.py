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