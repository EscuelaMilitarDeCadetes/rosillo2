from django.db.models import Sum

from apps.investigacion_formativa.models import ActividadFormativa


class ActividadFormativaSelector:

    @staticmethod
    def listar():
        return (
            ActividadFormativa.objects
            .select_related('proceso_formativo', 'responsable', 'documento_soporte')
            .order_by('-fecha_inicio')
        )

    @staticmethod
    def obtener(actividad_id):
        return ActividadFormativa.objects.get(pk=actividad_id)

    @staticmethod
    def buscar(actividad_id):
        return ActividadFormativa.objects.filter(pk=actividad_id).first()

    @staticmethod
    def existe(actividad_id):
        return ActividadFormativa.objects.filter(pk=actividad_id).exists()

    @staticmethod
    def listar_por_proceso(proceso_formativo_id):
        return (
            ActividadFormativa.objects
            .select_related('responsable', 'documento_soporte')
            .filter(proceso_formativo_id=proceso_formativo_id)
            .order_by('-fecha_inicio')
        )

    @staticmethod
    def listar_por_responsable(responsable_id):
        return (
            ActividadFormativa.objects
            .select_related('proceso_formativo')
            .filter(responsable_id=responsable_id)
            .order_by('-fecha_inicio')
        )

    @staticmethod
    def listar_por_estado(estado, proceso_formativo_id=None):
        qs = ActividadFormativa.objects.filter(estado=estado)
        if proceso_formativo_id is not None:
            qs = qs.filter(proceso_formativo_id=proceso_formativo_id)
        return qs.order_by('-fecha_inicio')

    @staticmethod
    def listar_planificadas(proceso_formativo_id=None):
        qs = ActividadFormativa.objects.filter(estado='PLANIFICADA')
        if proceso_formativo_id is not None:
            qs = qs.filter(proceso_formativo_id=proceso_formativo_id)
        return qs.order_by('fecha_inicio')

    @staticmethod
    def listar_en_progreso(proceso_formativo_id=None):
        qs = ActividadFormativa.objects.filter(estado='EN_PROGRESO')
        if proceso_formativo_id is not None:
            qs = qs.filter(proceso_formativo_id=proceso_formativo_id)
        return qs.order_by('fecha_inicio')

    @staticmethod
    def listar_completadas(proceso_formativo_id=None):
        qs = ActividadFormativa.objects.filter(estado='COMPLETADA')
        if proceso_formativo_id is not None:
            qs = qs.filter(proceso_formativo_id=proceso_formativo_id)
        return qs.order_by('-fecha_fin')

    @staticmethod
    def listar_sin_documento_soporte(proceso_formativo_id=None):
        qs = ActividadFormativa.objects.filter(documento_soporte__isnull=True)
        if proceso_formativo_id is not None:
            qs = qs.filter(proceso_formativo_id=proceso_formativo_id)
        return qs.order_by('-fecha_inicio')

    @staticmethod
    def sumar_horas_dedicadas_por_proceso(proceso_formativo_id, solo_completadas=True):
        qs = ActividadFormativa.objects.filter(proceso_formativo_id=proceso_formativo_id)
        if solo_completadas:
            qs = qs.filter(estado='COMPLETADA')
        return qs.aggregate(total=Sum('horas_dedicadas')).get('total') or 0