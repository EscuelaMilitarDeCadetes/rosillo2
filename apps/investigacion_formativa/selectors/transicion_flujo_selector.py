from apps.investigacion_formativa.models import TransicionFlujo


class TransicionFlujoSelector:

    @staticmethod
    def listar():
        return TransicionFlujo.objects.select_related('etapa_origen', 'etapa_destino').all()

    @staticmethod
    def obtener(transicion_id):
        return (
            TransicionFlujo.objects
            .select_related('etapa_origen', 'etapa_destino')
            .get(pk=transicion_id)
        )

    @staticmethod
    def buscar(transicion_id):
        return (
            TransicionFlujo.objects
            .select_related('etapa_origen', 'etapa_destino')
            .filter(pk=transicion_id)
            .first()
        )

    @staticmethod
    def existe(transicion_id):
        return TransicionFlujo.objects.filter(pk=transicion_id).exists()

    @staticmethod
    def listar_por_etapa_origen(etapa_origen_id):
        return (
            TransicionFlujo.objects
            .select_related('etapa_destino')
            .filter(etapa_origen_id=etapa_origen_id)
            .order_by('orden')
        )

    @staticmethod
    def listar_por_etapa_destino(etapa_destino_id):
        return (
            TransicionFlujo.objects
            .select_related('etapa_origen')
            .filter(etapa_destino_id=etapa_destino_id)
        )

    @staticmethod
    def obtener_por_origen_y_destino(etapa_origen_id, etapa_destino_id):
        return (
            TransicionFlujo.objects
            .filter(etapa_origen_id=etapa_origen_id, etapa_destino_id=etapa_destino_id)
            .first()
        )

    @staticmethod
    def existe_transicion(etapa_origen_id, etapa_destino_id, excluir_id=None):
        qs = TransicionFlujo.objects.filter(etapa_origen_id=etapa_origen_id, etapa_destino_id=etapa_destino_id)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_activas_por_etapa_origen(etapa_origen_id):
        return (
            TransicionFlujo.objects
            .select_related('etapa_destino')
            .filter(etapa_origen_id=etapa_origen_id, activo=True)
            .order_by('orden')
        )

    @staticmethod
    def listar_activas():
        return TransicionFlujo.objects.select_related('etapa_origen', 'etapa_destino').filter(activo=True)

    @staticmethod
    def listar_con_accion_automatica():
        return (
            TransicionFlujo.objects
            .select_related('etapa_origen', 'etapa_destino')
            .filter(accion_automatica__isnull=False)
            .exclude(accion_automatica='')
        )

    @staticmethod
    def listar_por_accion_automatica(accion_automatica):
        return TransicionFlujo.objects.filter(accion_automatica__iexact=accion_automatica)