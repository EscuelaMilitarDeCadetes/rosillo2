from apps.investigacion_formativa.models import SegundaInstancia


class SegundaInstanciaSelector:

    @staticmethod
    def listar():
        return (
            SegundaInstancia.objects
            .select_related('proceso', 'instancia_etapa', 'evaluacion', 'etapa_retorno')
            .all()
        )

    @staticmethod
    def obtener(segunda_instancia_id):
        return (
            SegundaInstancia.objects
            .select_related('proceso', 'instancia_etapa', 'evaluacion', 'etapa_retorno')
            .get(pk=segunda_instancia_id)
        )

    @staticmethod
    def buscar(segunda_instancia_id):
        return (
            SegundaInstancia.objects
            .select_related('proceso', 'instancia_etapa', 'evaluacion', 'etapa_retorno')
            .filter(pk=segunda_instancia_id)
            .first()
        )

    @staticmethod
    def existe(segunda_instancia_id):
        return SegundaInstancia.objects.filter(pk=segunda_instancia_id).exists()

    @staticmethod
    def obtener_por_proceso(proceso_id):
        return (
            SegundaInstancia.objects
            .select_related('instancia_etapa', 'evaluacion', 'etapa_retorno')
            .filter(proceso_id=proceso_id)
            .first()
        )

    @staticmethod
    def existe_para_proceso(proceso_id):
        return SegundaInstancia.objects.filter(proceso_id=proceso_id).exists()

    @staticmethod
    def listar_por_instancia_etapa(instancia_etapa_id):
        return (
            SegundaInstancia.objects
            .select_related('proceso')
            .filter(instancia_etapa_id=instancia_etapa_id)
        )

    @staticmethod
    def listar_por_tipo(tipo):
        return (
            SegundaInstancia.objects
            .select_related('proceso')
            .filter(tipo=tipo)
        )

    @staticmethod
    def listar_activas():
        return (
            SegundaInstancia.objects
            .select_related('proceso')
            .filter(activa=True)
        )

    @staticmethod
    def listar_activadas():
        return (
            SegundaInstancia.objects
            .select_related('proceso')
            .filter(activada=True)
        )

    @staticmethod
    def listar_consumidas():
        return SegundaInstancia.objects.filter(consumida=True)

    @staticmethod
    def listar_no_consumidas():
        return SegundaInstancia.objects.filter(consumida=False)

    @staticmethod
    def listar_activadas_pendientes():
        """Activadas, aún no consumidas: casos que requieren seguimiento."""
        return (
            SegundaInstancia.objects
            .select_related('proceso', 'instancia_etapa')
            .filter(activada=True, consumida=False, activa=True)
        )

    @staticmethod
    def listar_por_etapa_retorno(etapa_retorno_id):
        return SegundaInstancia.objects.filter(etapa_retorno_id=etapa_retorno_id)