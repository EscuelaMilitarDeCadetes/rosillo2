from apps.investigacion_formativa.models import ValidacionAntiplagio


class ValidacionAntiplagioSelector:

    @staticmethod
    def listar():
        return ValidacionAntiplagio.objects.select_related('instancia_etapa', 'documento').all()

    @staticmethod
    def obtener(validacion_id):
        return (
            ValidacionAntiplagio.objects
            .select_related('instancia_etapa', 'documento')
            .get(pk=validacion_id)
        )

    @staticmethod
    def buscar(validacion_id):
        return (
            ValidacionAntiplagio.objects
            .select_related('instancia_etapa', 'documento')
            .filter(pk=validacion_id)
            .first()
        )

    @staticmethod
    def existe(validacion_id):
        return ValidacionAntiplagio.objects.filter(pk=validacion_id).exists()

    @staticmethod
    def listar_por_instancia_etapa(instancia_etapa_id):
        return (
            ValidacionAntiplagio.objects
            .select_related('documento')
            .filter(instancia_etapa_id=instancia_etapa_id)
        )

    @staticmethod
    def obtener_por_instancia_y_documento(instancia_etapa_id, documento_id):
        return (
            ValidacionAntiplagio.objects
            .filter(instancia_etapa_id=instancia_etapa_id, documento_id=documento_id)
            .first()
        )

    @staticmethod
    def existe_validacion(instancia_etapa_id, documento_id, excluir_id=None):
        qs = ValidacionAntiplagio.objects.filter(instancia_etapa_id=instancia_etapa_id, documento_id=documento_id)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_aprobadas_por_instancia_etapa(instancia_etapa_id):
        return ValidacionAntiplagio.objects.filter(instancia_etapa_id=instancia_etapa_id, aprobado=True)

    @staticmethod
    def listar_no_aprobadas_por_instancia_etapa(instancia_etapa_id):
        return ValidacionAntiplagio.objects.filter(instancia_etapa_id=instancia_etapa_id, aprobado=False)

    @staticmethod
    def listar_por_porcentaje_mayor_a(instancia_etapa_id, porcentaje_minimo):
        return ValidacionAntiplagio.objects.filter(
            instancia_etapa_id=instancia_etapa_id, porcentaje__gte=porcentaje_minimo
        )

    @staticmethod
    def obtener_ultima_por_instancia_etapa(instancia_etapa_id):
        """El modelo no tiene campo de fecha; se usa el pk como proxy del orden de creación."""
        return (
            ValidacionAntiplagio.objects
            .select_related('documento')
            .filter(instancia_etapa_id=instancia_etapa_id)
            .order_by('-pk')
            .first()
        )