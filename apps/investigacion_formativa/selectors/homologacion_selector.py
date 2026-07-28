from apps.investigacion_formativa.models import Homologacion


class HomologacionSelector:

    @staticmethod
    def listar():
        return (
            Homologacion.objects
            .select_related('proceso', 'acta_homologacion', 'aprobado_por')
            .order_by('-fecha_homologacion')
        )

    @staticmethod
    def obtener(homologacion_id):
        return Homologacion.objects.get(pk=homologacion_id)

    @staticmethod
    def buscar(homologacion_id):
        return Homologacion.objects.filter(pk=homologacion_id).first()

    @staticmethod
    def existe(homologacion_id):
        return Homologacion.objects.filter(pk=homologacion_id).exists()

    @staticmethod
    def obtener_por_proceso(proceso_id):
        """El proceso tiene a lo sumo una homologación (OneToOneField)."""
        return Homologacion.objects.filter(proceso_id=proceso_id).first()

    @staticmethod
    def existe_para_proceso(proceso_id):
        return Homologacion.objects.filter(proceso_id=proceso_id).exists()

    @staticmethod
    def listar_por_estado(estado):
        return (
            Homologacion.objects
            .select_related('proceso')
            .filter(estado=estado)
            .order_by('-fecha_homologacion')
        )

    @staticmethod
    def listar_pendientes():
        return Homologacion.objects.filter(estado='PENDIENTE').select_related('proceso')

    @staticmethod
    def listar_aprobadas():
        return Homologacion.objects.filter(estado='APROBADA').select_related('proceso')

    @staticmethod
    def listar_rechazadas():
        return Homologacion.objects.filter(estado='RECHAZADA').select_related('proceso')

    @staticmethod
    def listar_sin_acta(estado=None):
        qs = Homologacion.objects.filter(acta_homologacion__isnull=True)
        if estado is not None:
            qs = qs.filter(estado=estado)
        return qs

    @staticmethod
    def listar_por_aprobador(usuario_id):
        return Homologacion.objects.filter(aprobado_por_id=usuario_id).order_by('-fecha_homologacion')