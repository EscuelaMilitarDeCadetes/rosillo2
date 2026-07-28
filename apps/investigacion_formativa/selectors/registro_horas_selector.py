from django.db.models import F

from apps.investigacion_formativa.models import RegistroHoras


class RegistroHorasSelector:

    @staticmethod
    def listar():
        return RegistroHoras.objects.select_related('proceso').all()

    @staticmethod
    def obtener(registro_horas_id):
        return RegistroHoras.objects.select_related('proceso').get(pk=registro_horas_id)

    @staticmethod
    def buscar(registro_horas_id):
        return (
            RegistroHoras.objects
            .select_related('proceso')
            .filter(pk=registro_horas_id)
            .first()
        )

    @staticmethod
    def existe(registro_horas_id):
        return RegistroHoras.objects.filter(pk=registro_horas_id).exists()

    @staticmethod
    def obtener_por_proceso(proceso_id):
        return (
            RegistroHoras.objects
            .select_related('proceso')
            .filter(proceso_id=proceso_id)
            .first()
        )

    @staticmethod
    def listar_por_proceso(proceso_id):
        return RegistroHoras.objects.filter(proceso_id=proceso_id)

    @staticmethod
    def existe_para_proceso(proceso_id):
        return RegistroHoras.objects.filter(proceso_id=proceso_id).exists()

    @staticmethod
    def listar_que_cumplen_requisito():
        return (
            RegistroHoras.objects
            .select_related('proceso')
            .filter(cumple_requisito=True)
        )

    @staticmethod
    def listar_que_no_cumplen_requisito():
        return (
            RegistroHoras.objects
            .select_related('proceso')
            .filter(cumple_requisito=False)
        )

    @staticmethod
    def listar_con_horas_pendientes():
        """Registros cuyas horas acumuladas aún no alcanzan las requeridas."""
        return (
            RegistroHoras.objects
            .select_related('proceso')
            .filter(horas_acumuladas__lt=F('horas_requeridas'))
        )

    @staticmethod
    def listar_por_rango_horas_requeridas(minimo, maximo):
        return (
            RegistroHoras.objects
            .select_related('proceso')
            .filter(horas_requeridas__range=(minimo, maximo))
        )