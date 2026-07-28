from apps.investigacion_formativa.models import InstanciaEtapa


class InstanciaEtapaSelector:

    @staticmethod
    def listar():
        return (
            InstanciaEtapa.objects
            .select_related('proceso', 'etapa')
            .order_by('proceso', 'etapa__orden')
        )

    @staticmethod
    def obtener(instancia_id):
        return InstanciaEtapa.objects.get(pk=instancia_id)

    @staticmethod
    def buscar(instancia_id):
        return InstanciaEtapa.objects.filter(pk=instancia_id).first()

    @staticmethod
    def existe(instancia_id):
        return InstanciaEtapa.objects.filter(pk=instancia_id).exists()

    @staticmethod
    def existe_etapa_en_proceso(proceso_id, etapa_id, excluir_id=None):
        """Valida unique_together ('proceso', 'etapa') antes de crear/actualizar."""
        qs = InstanciaEtapa.objects.filter(proceso_id=proceso_id, etapa_id=etapa_id)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def obtener_por_proceso_y_etapa(proceso_id, etapa_id):
        return InstanciaEtapa.objects.filter(proceso_id=proceso_id, etapa_id=etapa_id).first()

    @staticmethod
    def listar_por_proceso(proceso_id):
        return (
            InstanciaEtapa.objects
            .select_related('etapa')
            .filter(proceso_id=proceso_id)
            .order_by('etapa__orden')
        )

    @staticmethod
    def listar_por_estado(estado, proceso_id=None):
        qs = InstanciaEtapa.objects.filter(estado=estado)
        if proceso_id is not None:
            qs = qs.filter(proceso_id=proceso_id)
        return qs.select_related('etapa').order_by('etapa__orden')

    @staticmethod
    def listar_pendientes(proceso_id=None):
        qs = InstanciaEtapa.objects.filter(estado='PENDIENTE')
        if proceso_id is not None:
            qs = qs.filter(proceso_id=proceso_id)
        return qs.order_by('etapa__orden')

    @staticmethod
    def listar_en_proceso(proceso_id=None):
        qs = InstanciaEtapa.objects.filter(estado='EN_PROCESO')
        if proceso_id is not None:
            qs = qs.filter(proceso_id=proceso_id)
        return qs.order_by('etapa__orden')

    @staticmethod
    def listar_en_segunda_instancia(proceso_id=None):
        qs = InstanciaEtapa.objects.filter(estado='SEGUNDA_INSTANCIA')
        if proceso_id is not None:
            qs = qs.filter(proceso_id=proceso_id)
        return qs.order_by('etapa__orden')

    @staticmethod
    def listar_sin_fecha_fin(proceso_id=None):
        qs = InstanciaEtapa.objects.filter(fecha_fin__isnull=True)
        if proceso_id is not None:
            qs = qs.filter(proceso_id=proceso_id)
        return qs.select_related('etapa').order_by('etapa__orden')

    @staticmethod
    def listar_por_etapa(etapa_id, estado=None):
        qs = InstanciaEtapa.objects.filter(etapa_id=etapa_id)
        if estado is not None:
            qs = qs.filter(estado=estado)
        return qs.select_related('proceso').order_by('-fecha_inicio')