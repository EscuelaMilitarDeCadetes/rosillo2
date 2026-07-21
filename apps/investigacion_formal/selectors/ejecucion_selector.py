from django.db.models import Sum

from apps.investigacion_formal.models import Ejecucion


class EjecucionSelector:

    @staticmethod
    def listar():
        return Ejecucion.objects.select_related('monto', 'tipo_rubro').filter(estado=True)

    @staticmethod
    def listar_historico():
        return Ejecucion.objects.select_related('monto', 'tipo_rubro').all()

    @staticmethod
    def obtener(ejecucion_id):
        return Ejecucion.objects.select_related('monto', 'tipo_rubro').get(pk=ejecucion_id)

    @staticmethod
    def buscar(ejecucion_id):
        return (
            Ejecucion.objects
            .select_related('monto', 'tipo_rubro')
            .filter(pk=ejecucion_id)
            .first()
        )

    @staticmethod
    def existe(ejecucion_id):
        return Ejecucion.objects.filter(pk=ejecucion_id).exists()

    @staticmethod
    def listar_por_monto(monto_id, solo_activas=True):
        qs = Ejecucion.objects.select_related('tipo_rubro').filter(monto_id=monto_id)
        if solo_activas:
            qs = qs.filter(estado=True)
        return qs

    @staticmethod
    def listar_por_tipo_rubro(tipo_rubro_id, solo_activas=True):
        qs = Ejecucion.objects.select_related('monto').filter(tipo_rubro_id=tipo_rubro_id)
        if solo_activas:
            qs = qs.filter(estado=True)
        return qs

    @staticmethod
    def total_ejecutado_por_monto(monto_id):
        total = Ejecucion.objects.filter(monto_id=monto_id, estado=True).aggregate(
            total=Sum('costo')
        )
        return total.get('total') or 0

    @staticmethod
    def existe_nombre_para_monto(monto_id, nombre, excluir_id=None):
        qs = Ejecucion.objects.filter(monto_id=monto_id, nombre__iexact=nombre, estado=True)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()