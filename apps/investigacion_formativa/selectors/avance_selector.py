from django.db.models import Sum

from apps.investigacion_formativa.models import (
    RegistroActividades, RegistroHoras, InstanciaEtapa,
)


class AvanceSelector:

    @staticmethod
    def listar_registros_por_proceso(proceso_id):
        """Registros de actividades (avances) de un proceso, del más reciente al más antiguo."""
        return (
            RegistroActividades.objects
            .select_related('registrado_por', 'documento')
            .filter(proceso_id=proceso_id)
            .order_by('-fecha_periodo')
        )

    @staticmethod
    def listar_registros_por_tipo_periodo(proceso_id, tipo_periodo):
        return (
            RegistroActividades.objects
            .filter(proceso_id=proceso_id, tipo_periodo=tipo_periodo)
            .order_by('-fecha_periodo')
        )

    @staticmethod
    def obtener_ultimo_registro(proceso_id):
        return (
            RegistroActividades.objects
            .filter(proceso_id=proceso_id)
            .order_by('-fecha_periodo')
            .first()
        )

    @staticmethod
    def existe_registro_periodo(proceso_id, registrado_por_id, fecha_periodo):
        """Valida unique_together ('proceso', 'registrado_por', 'fecha_periodo') antes de crear."""
        return RegistroActividades.objects.filter(
            proceso_id=proceso_id,
            registrado_por_id=registrado_por_id,
            fecha_periodo=fecha_periodo,
        ).exists()

    @staticmethod
    def listar_registros_pendientes_aprobacion(proceso_id=None):
        qs = RegistroActividades.objects.filter(aprobado=False)
        if proceso_id is not None:
            qs = qs.filter(proceso_id=proceso_id)
        return qs.order_by('fecha_periodo')

    @staticmethod
    def sumar_horas_reportadas(proceso_id):
        return (
            RegistroActividades.objects
            .filter(proceso_id=proceso_id)
            .aggregate(total=Sum('horas_reportadas'))
            .get('total') or 0
        )

    @staticmethod
    def obtener_control_horas(proceso_id):
        return RegistroHoras.objects.filter(proceso_id=proceso_id).first()

    @staticmethod
    def listar_procesos_que_cumplen_horas():
        return RegistroHoras.objects.filter(cumple_requisito=True).select_related('proceso')

    @staticmethod
    def listar_instancias_etapa(proceso_id):
        """Etapas instanciadas del proceso, ordenadas según el orden definido en el flujo."""
        return (
            InstanciaEtapa.objects
            .select_related('etapa')
            .filter(proceso_id=proceso_id)
            .order_by('etapa__orden')
        )

    @staticmethod
    def obtener_instancia_actual(proceso_id):
        """Primera etapa del proceso que aún no ha sido aprobada (etapa vigente)."""
        return (
            InstanciaEtapa.objects
            .select_related('etapa')
            .filter(proceso_id=proceso_id)
            .exclude(estado='APROBADO')
            .order_by('etapa__orden')
            .first()
        )

    @staticmethod
    def contar_etapas_aprobadas(proceso_id):
        return InstanciaEtapa.objects.filter(proceso_id=proceso_id, estado='APROBADO').count()

    @staticmethod
    def contar_etapas_totales(proceso_id):
        return InstanciaEtapa.objects.filter(proceso_id=proceso_id).count()

    @staticmethod
    def existe_etapa_en_segunda_instancia(proceso_id):
        return InstanciaEtapa.objects.filter(
            proceso_id=proceso_id, estado='SEGUNDA_INSTANCIA'
        ).exists()