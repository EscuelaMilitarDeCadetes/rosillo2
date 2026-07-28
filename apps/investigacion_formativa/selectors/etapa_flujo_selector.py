from apps.investigacion_formativa.models import EtapaFlujo


class EtapaFlujoSelector:

    @staticmethod
    def listar():
        return (
            EtapaFlujo.objects
            .select_related('flujo', 'documento_requerido')
            .filter(activo=True)
            .order_by('flujo', 'orden')
        )

    @staticmethod
    def obtener(etapa_id):
        return EtapaFlujo.objects.get(pk=etapa_id)

    @staticmethod
    def buscar(etapa_id):
        return EtapaFlujo.objects.filter(pk=etapa_id).first()

    @staticmethod
    def existe(etapa_id):
        return EtapaFlujo.objects.filter(pk=etapa_id).exists()

    @staticmethod
    def existe_orden_en_flujo(flujo_id, orden, excluir_id=None):
        """Valida unique_together ('flujo', 'orden') antes de crear/actualizar."""
        qs = EtapaFlujo.objects.filter(flujo_id=flujo_id, orden=orden)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_por_flujo(flujo_id):
        return (
            EtapaFlujo.objects
            .select_related('documento_requerido')
            .filter(flujo_id=flujo_id, activo=True)
            .order_by('orden')
        )

    @staticmethod
    def obtener_primera_etapa(flujo_id):
        return EtapaFlujo.objects.filter(flujo_id=flujo_id).order_by('orden').first()

    @staticmethod
    def obtener_siguiente_etapa(flujo_id, orden_actual):
        return (
            EtapaFlujo.objects
            .filter(flujo_id=flujo_id, orden__gt=orden_actual)
            .order_by('orden')
            .first()
        )

    @staticmethod
    def obtener_etapa_anterior(flujo_id, orden_actual):
        return (
            EtapaFlujo.objects
            .filter(flujo_id=flujo_id, orden__lt=orden_actual)
            .order_by('-orden')
            .first()
        )

    @staticmethod
    def listar_etapas_finales(flujo_id):
        return EtapaFlujo.objects.filter(flujo_id=flujo_id, es_final=True)

    @staticmethod
    def listar_obligatorias(flujo_id):
        return EtapaFlujo.objects.filter(flujo_id=flujo_id, es_obligatoria=True).order_by('orden')

    @staticmethod
    def listar_por_rol_responsable(flujo_id, rol_responsable):
        return EtapaFlujo.objects.filter(
            flujo_id=flujo_id, rol_responsable=rol_responsable
        ).order_by('orden')

    @staticmethod
    def listar_por_tipo_etapa(flujo_id, tipo_etapa):
        return EtapaFlujo.objects.filter(flujo_id=flujo_id, tipo_etapa=tipo_etapa).order_by('orden')