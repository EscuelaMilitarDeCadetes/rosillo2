from django.db.models import Q

from apps.investigacion_formativa.models import ReglaFlujo


class ReglaFlujoSelector:

    @staticmethod
    def listar():
        return ReglaFlujo.objects.select_related('etapa_origen', 'etapa_destino').all()

    @staticmethod
    def obtener(regla_flujo_id):
        return (
            ReglaFlujo.objects
            .select_related('etapa_origen', 'etapa_destino')
            .get(pk=regla_flujo_id)
        )

    @staticmethod
    def buscar(regla_flujo_id):
        return (
            ReglaFlujo.objects
            .select_related('etapa_origen', 'etapa_destino')
            .filter(pk=regla_flujo_id)
            .first()
        )

    @staticmethod
    def existe(regla_flujo_id):
        return ReglaFlujo.objects.filter(pk=regla_flujo_id).exists()

    @staticmethod
    def listar_por_etapa_origen(etapa_origen_id):
        return (
            ReglaFlujo.objects
            .select_related('etapa_destino')
            .filter(etapa_origen_id=etapa_origen_id)
            .order_by('prioridad')
        )

    @staticmethod
    def listar_por_etapa_destino(etapa_destino_id):
        return (
            ReglaFlujo.objects
            .select_related('etapa_origen')
            .filter(etapa_destino_id=etapa_destino_id)
            .order_by('prioridad')
        )

    @staticmethod
    def listar_por_transicion(etapa_origen_id, etapa_destino_id):
        return (
            ReglaFlujo.objects
            .filter(etapa_origen_id=etapa_origen_id, etapa_destino_id=etapa_destino_id)
            .order_by('prioridad')
        )

    @staticmethod
    def obtener_por_transicion_y_nombre(etapa_origen_id, etapa_destino_id, nombre):
        return (
            ReglaFlujo.objects
            .filter(etapa_origen_id=etapa_origen_id, etapa_destino_id=etapa_destino_id, nombre__iexact=nombre)
            .first()
        )

    @staticmethod
    def existe_regla(etapa_origen_id, etapa_destino_id, nombre, excluir_id=None):
        qs = ReglaFlujo.objects.filter(
            etapa_origen_id=etapa_origen_id,
            etapa_destino_id=etapa_destino_id,
            nombre__iexact=nombre,
        )
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_activas():
        return (
            ReglaFlujo.objects
            .select_related('etapa_origen', 'etapa_destino')
            .filter(activa=True)
        )

    @staticmethod
    def listar_por_tipo_regla(tipo_regla):
        return (
            ReglaFlujo.objects
            .select_related('etapa_origen', 'etapa_destino')
            .filter(tipo_regla=tipo_regla)
        )

    @staticmethod
    def listar_bloqueantes():
        return ReglaFlujo.objects.filter(bloqueante=True, activa=True)

    @staticmethod
    def listar_no_bloqueantes():
        return ReglaFlujo.objects.filter(bloqueante=False, activa=True)

    @staticmethod
    def listar_vigentes(fecha):
        return (
            ReglaFlujo.objects
            .select_related('etapa_origen', 'etapa_destino')
            .filter(Q(fecha_inicio__lte=fecha) & (Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=fecha)))
        )

    @staticmethod
    def listar_activas_por_transicion_ordenadas(etapa_origen_id, etapa_destino_id):
        return (
            ReglaFlujo.objects
            .filter(etapa_origen_id=etapa_origen_id, etapa_destino_id=etapa_destino_id, activa=True)
            .order_by('prioridad')
        )