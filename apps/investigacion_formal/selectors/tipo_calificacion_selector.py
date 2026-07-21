from apps.investigacion_formal.models import TipoCalificacion


class TipoCalificacionSelector:

    @staticmethod
    def listar():
        return TipoCalificacion.objects.all().order_by('ordenFase')

    @staticmethod
    def obtener(tipo_calificacion_id):
        return TipoCalificacion.objects.get(pk=tipo_calificacion_id)

    @staticmethod
    def buscar(tipo_calificacion_id):
        return TipoCalificacion.objects.filter(pk=tipo_calificacion_id).first()

    @staticmethod
    def existe(tipo_calificacion_id):
        return TipoCalificacion.objects.filter(pk=tipo_calificacion_id).exists()

    @staticmethod
    def obtener_por_nombre(tipo_calificacion):
        return TipoCalificacion.objects.filter(tipo_calificacion__iexact=tipo_calificacion).first()

    @staticmethod
    def existe_nombre(tipo_calificacion, excluir_id=None):
        qs = TipoCalificacion.objects.filter(tipo_calificacion__iexact=tipo_calificacion)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_evaluables():
        return TipoCalificacion.objects.filter(evaluacion=True).order_by('ordenFase')

    @staticmethod
    def obtener_por_orden(orden_fase):
        return TipoCalificacion.objects.filter(ordenFase=orden_fase).first()

    @staticmethod
    def obtener_primera_fase():
        return TipoCalificacion.objects.order_by('ordenFase').first()

    @staticmethod
    def obtener_ultima_fase():
        return TipoCalificacion.objects.order_by('-ordenFase').first()

    @staticmethod
    def obtener_siguiente_fase(orden_actual):
        return (
            TipoCalificacion.objects
            .filter(ordenFase__gt=orden_actual)
            .order_by('ordenFase')
            .first()
        )

    @staticmethod
    def existe_orden(orden_fase, excluir_id=None):
        qs = TipoCalificacion.objects.filter(ordenFase=orden_fase)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()