from django.utils import timezone

from apps.investigacion_formal.models import Convocatoria


class ConvocatoriaSelector:

    @staticmethod
    def listar():
        return Convocatoria.objects.all().order_by('-anio_convocatoria', 'nombre_convocatoria')

    @staticmethod
    def obtener(convocatoria_id):
        return Convocatoria.objects.get(pk=convocatoria_id)

    @staticmethod
    def buscar(convocatoria_id):
        return Convocatoria.objects.filter(pk=convocatoria_id).first()

    @staticmethod
    def existe(convocatoria_id):
        return Convocatoria.objects.filter(pk=convocatoria_id).exists()

    @staticmethod
    def obtener_por_nombre(nombre_convocatoria):
        return Convocatoria.objects.filter(nombre_convocatoria__iexact=nombre_convocatoria).first()

    @staticmethod
    def existe_nombre(nombre_convocatoria, excluir_id=None):
        qs = Convocatoria.objects.filter(nombre_convocatoria__iexact=nombre_convocatoria)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_activas():
        return Convocatoria.objects.filter(estado=True).order_by('-anio_convocatoria')

    @staticmethod
    def listar_inactivas():
        return Convocatoria.objects.filter(estado=False).order_by('-anio_convocatoria')

    @staticmethod
    def listar_internas(estado=None):
        qs = Convocatoria.objects.filter(interno=True)
        if estado is not None:
            qs = qs.filter(estado=estado)
        return qs.order_by('-anio_convocatoria')

    @staticmethod
    def listar_externas(estado=None):
        qs = Convocatoria.objects.filter(interno=False)
        if estado is not None:
            qs = qs.filter(estado=estado)
        return qs.order_by('-anio_convocatoria')

    @staticmethod
    def listar_por_anio(anio_convocatoria):
        return Convocatoria.objects.filter(anio_convocatoria=anio_convocatoria)

    @staticmethod
    def listar_vigentes_hoy():
        hoy = timezone.now().date()
        return Convocatoria.objects.filter(
            estado=True, inicio__lte=hoy, cierre__gte=hoy
        )

    @staticmethod
    def listar_vencidas():
        hoy = timezone.now().date()
        return Convocatoria.objects.filter(estado=True, cierre__lt=hoy)
    
    @staticmethod
    def buscar_por_nombre(nombre_convocatoria):
        """Variante silenciosa de obtener(): retorna None si no existe,
        en vez de lanzar excepción. Necesaria para el patrón
        buscar-o-crear de crear_proyecto_externo()."""
        return Convocatoria.objects.filter(
            nombre_convocatoria=nombre_convocatoria
        ).first()