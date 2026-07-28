# apps/investigacion_formativa/selectors/certificacion_externa_selector.py
from django.db.models import Sum
from apps.investigacion_formativa.models import CertificacionExterna


class CertificacionExternaSelector:
    @staticmethod
    def listar():
        return (
            CertificacionExterna.objects
            .select_related('proceso', 'certificado_asistencia', 'certificado_aprobacion', 'validado_por')
            .filter(activo=True)
            .order_by('-fecha_inicio')
        )

    @staticmethod
    def obtener(certificacion_id):
        return CertificacionExterna.objects.get(pk=certificacion_id)

    @staticmethod
    def buscar(certificacion_id):
        return CertificacionExterna.objects.filter(pk=certificacion_id).first()

    @staticmethod
    def existe(certificacion_id):
        return CertificacionExterna.objects.filter(pk=certificacion_id).exists()

    @staticmethod
    def listar_por_proceso(proceso_id):
        return (
            CertificacionExterna.objects
            .select_related('certificado_asistencia', 'certificado_aprobacion', 'validado_por')
            .filter(proceso_id=proceso_id, activo=True)
            .order_by('-fecha_inicio')
        )

    @staticmethod
    def listar_por_tipo(tipo, proceso_id=None):
        qs = CertificacionExterna.objects.filter(tipo=tipo, activo=True)
        if proceso_id is not None:
            qs = qs.filter(proceso_id=proceso_id)
        return qs.order_by('-fecha_inicio')

    @staticmethod
    def listar_pendientes_validacion(proceso_id=None):
        """Certificaciones con certificado de aprobación cargado pero aún sin validar por facultades."""
        qs = CertificacionExterna.objects.filter(
            certificado_aprobacion__isnull=False, fecha_validacion__isnull=True, activo=True,
        )
        if proceso_id is not None:
            qs = qs.filter(proceso_id=proceso_id)
        return qs.order_by('fecha_inicio')

    @staticmethod
    def listar_validadas(proceso_id=None):
        qs = CertificacionExterna.objects.filter(fecha_validacion__isnull=False, activo=True)
        if proceso_id is not None:
            qs = qs.filter(proceso_id=proceso_id)
        return qs.order_by('-fecha_validacion')

    @staticmethod
    def listar_que_cumplen_horas(proceso_id=None):
        """Certificaciones donde horas_validadas >= 120 (cumple_horas = True)."""
        qs = CertificacionExterna.objects.filter(cumple_horas=True, activo=True)
        if proceso_id is not None:
            qs = qs.filter(proceso_id=proceso_id)
        return qs.order_by('-fecha_validacion')

    @staticmethod
    def sumar_horas_validadas_por_proceso(proceso_id):
        return (
            CertificacionExterna.objects
            .filter(proceso_id=proceso_id, activo=True)
            .aggregate(total=Sum('horas_validadas'))
            .get('total') or 0
        )

    @staticmethod
    def listar_por_validador(usuario_id):
        return (
            CertificacionExterna.objects
            .filter(validado_por_id=usuario_id, activo=True)
            .order_by('-fecha_validacion')
        )