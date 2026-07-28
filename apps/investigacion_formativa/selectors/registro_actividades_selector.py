# apps/investigacion_formativa/selectors/registro_actividades_selector.py
from django.db.models import Sum
from apps.investigacion_formativa.models import RegistroActividades


class RegistroActividadesSelector:
    @staticmethod
    def listar():
        return (
            RegistroActividades.objects
            .select_related('proceso', 'registrado_por', 'documento')
            .filter(activo=True)
        )

    @staticmethod
    def obtener(registro_id):
        return (
            RegistroActividades.objects
            .select_related('proceso', 'registrado_por', 'documento')
            .get(pk=registro_id)
        )

    @staticmethod
    def buscar(registro_id):
        return (
            RegistroActividades.objects
            .select_related('proceso', 'registrado_por', 'documento')
            .filter(pk=registro_id)
            .first()
        )

    @staticmethod
    def existe(registro_id):
        return RegistroActividades.objects.filter(pk=registro_id).exists()

    @staticmethod
    def listar_por_proceso(proceso_id):
        return (
            RegistroActividades.objects
            .select_related('registrado_por', 'documento')
            .filter(proceso_id=proceso_id, activo=True)
            .order_by('-fecha_periodo')
        )

    @staticmethod
    def listar_por_registrado_por(usuario_id):
        return (
            RegistroActividades.objects
            .select_related('proceso')
            .filter(registrado_por_id=usuario_id, activo=True)
            .order_by('-fecha_periodo')
        )

    @staticmethod
    def obtener_por_proceso_y_periodo(proceso_id, registrado_por_id, fecha_periodo):
        return (
            RegistroActividades.objects
            .filter(
                proceso_id=proceso_id, registrado_por_id=registrado_por_id,
                fecha_periodo=fecha_periodo, activo=True,
            )
            .first()
        )

    @staticmethod
    def existe_registro(proceso_id, registrado_por_id, fecha_periodo, excluir_id=None):
        qs = RegistroActividades.objects.filter(
            proceso_id=proceso_id,
            registrado_por_id=registrado_por_id,
            fecha_periodo=fecha_periodo,
            activo=True,
        )
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_por_tipo_periodo(proceso_id, tipo_periodo):
        return (
            RegistroActividades.objects
            .filter(proceso_id=proceso_id, tipo_periodo=tipo_periodo, activo=True)
            .order_by('-fecha_periodo')
        )

    @staticmethod
    def listar_aprobados_por_proceso(proceso_id):
        return (
            RegistroActividades.objects
            .select_related('registrado_por')
            .filter(proceso_id=proceso_id, aprobado=True, activo=True)
            .order_by('-fecha_periodo')
        )

    @staticmethod
    def listar_no_aprobados_por_proceso(proceso_id):
        return (
            RegistroActividades.objects
            .select_related('registrado_por')
            .filter(proceso_id=proceso_id, aprobado=False, activo=True)
            .order_by('-fecha_periodo')
        )

    @staticmethod
    def listar_por_rango_fechas(proceso_id, fecha_inicio, fecha_fin):
        return (
            RegistroActividades.objects
            .select_related('registrado_por')
            .filter(proceso_id=proceso_id, fecha_periodo__range=(fecha_inicio, fecha_fin), activo=True)
            .order_by('fecha_periodo')
        )

    @staticmethod
    def listar_con_documento_por_proceso(proceso_id):
        return (
            RegistroActividades.objects
            .select_related('documento')
            .filter(proceso_id=proceso_id, documento__isnull=False, activo=True)
        )

    @staticmethod
    def listar_sin_documento_por_proceso(proceso_id):
        return RegistroActividades.objects.filter(
            proceso_id=proceso_id, documento__isnull=True, activo=True,
        )

    @staticmethod
    def obtener_ultimo_por_proceso(proceso_id):
        return (
            RegistroActividades.objects
            .select_related('registrado_por')
            .filter(proceso_id=proceso_id, activo=True)
            .order_by('-fecha_periodo')
            .first()
        )

    @staticmethod
    def sumar_horas_reportadas_por_proceso(proceso_id):
        total = (
            RegistroActividades.objects
            .filter(proceso_id=proceso_id, activo=True)
            .aggregate(total=Sum('horas_reportadas'))
        )
        return total['total'] or 0