from apps.investigacion_formativa.models import ParticipanteProceso


class ParticipanteProcesoSelector:

    @staticmethod
    def listar():
        return (
            ParticipanteProceso.objects
            .select_related('proceso_formativo', 'persona')
            .all()
        )

    @staticmethod
    def obtener(participante_id):
        return (
            ParticipanteProceso.objects
            .select_related('proceso_formativo', 'persona')
            .get(pk=participante_id)
        )

    @staticmethod
    def buscar(participante_id):
        return (
            ParticipanteProceso.objects
            .select_related('proceso_formativo', 'persona')
            .filter(pk=participante_id)
            .first()
        )

    @staticmethod
    def existe(participante_id):
        return ParticipanteProceso.objects.filter(pk=participante_id).exists()

    @staticmethod
    def listar_por_proceso(proceso_formativo_id):
        return (
            ParticipanteProceso.objects
            .select_related('persona')
            .filter(proceso_formativo_id=proceso_formativo_id)
        )

    @staticmethod
    def listar_por_persona(persona_id):
        return (
            ParticipanteProceso.objects
            .select_related('proceso_formativo')
            .filter(persona_id=persona_id)
        )

    @staticmethod
    def obtener_por_proceso_y_persona(proceso_formativo_id, persona_id):
        return (
            ParticipanteProceso.objects
            .filter(proceso_formativo_id=proceso_formativo_id, persona_id=persona_id)
            .first()
        )

    @staticmethod
    def existe_participante(proceso_formativo_id, persona_id, excluir_id=None):
        qs = ParticipanteProceso.objects.filter(
            proceso_formativo_id=proceso_formativo_id, persona_id=persona_id
        )
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_por_rol(proceso_formativo_id, rol_en_modalidad):
        return (
            ParticipanteProceso.objects
            .select_related('persona')
            .filter(proceso_formativo_id=proceso_formativo_id, rol_en_modalidad=rol_en_modalidad)
        )

    @staticmethod
    def listar_activos_por_proceso(proceso_formativo_id):
        return (
            ParticipanteProceso.objects
            .select_related('persona')
            .filter(proceso_formativo_id=proceso_formativo_id, activo=True)
        )

    @staticmethod
    def listar_estudiantes_por_proceso(proceso_formativo_id):
        return ParticipanteProceso.objects.select_related('persona').filter(
            proceso_formativo_id=proceso_formativo_id, rol_en_modalidad='ESTUDIANTE'
        )

    @staticmethod
    def listar_tutores_por_proceso(proceso_formativo_id):
        return ParticipanteProceso.objects.select_related('persona').filter(
            proceso_formativo_id=proceso_formativo_id, rol_en_modalidad='TUTOR'
        )

    @staticmethod
    def listar_jurados_por_proceso(proceso_formativo_id):
        return ParticipanteProceso.objects.select_related('persona').filter(
            proceso_formativo_id=proceso_formativo_id, rol_en_modalidad='JURADO'
        )

    @staticmethod
    def listar_finalizados_por_proceso(proceso_formativo_id):
        return ParticipanteProceso.objects.filter(
            proceso_formativo_id=proceso_formativo_id, fecha_finalizacion__isnull=False
        )

    @staticmethod
    def listar_activos_por_persona(persona_id):
        return (
            ParticipanteProceso.objects
            .select_related('proceso_formativo')
            .filter(persona_id=persona_id, activo=True)
        )