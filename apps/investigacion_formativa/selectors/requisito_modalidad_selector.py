from apps.investigacion_formativa.models import RequisitoModalidad


class RequisitoModalidadSelector:

    @staticmethod
    def listar():
        return RequisitoModalidad.objects.select_related('modalidad').all()

    @staticmethod
    def obtener(requisito_id):
        return RequisitoModalidad.objects.select_related('modalidad').get(pk=requisito_id)

    @staticmethod
    def buscar(requisito_id):
        return (
            RequisitoModalidad.objects
            .select_related('modalidad')
            .filter(pk=requisito_id)
            .first()
        )

    @staticmethod
    def existe(requisito_id):
        return RequisitoModalidad.objects.filter(pk=requisito_id).exists()

    @staticmethod
    def listar_por_modalidad(modalidad_id):
        return RequisitoModalidad.objects.filter(modalidad_id=modalidad_id)

    @staticmethod
    def obtener_por_modalidad_y_tipo(modalidad_id, tipo):
        return (
            RequisitoModalidad.objects
            .filter(modalidad_id=modalidad_id, tipo=tipo)
            .first()
        )

    @staticmethod
    def existe_requisito(modalidad_id, tipo, excluir_id=None):
        qs = RequisitoModalidad.objects.filter(modalidad_id=modalidad_id, tipo=tipo)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_activos_por_modalidad(modalidad_id):
        return RequisitoModalidad.objects.filter(modalidad_id=modalidad_id, activo=True)

    @staticmethod
    def listar_por_tipo(tipo):
        return (
            RequisitoModalidad.objects
            .select_related('modalidad')
            .filter(tipo=tipo)
        )

    @staticmethod
    def listar_con_valor_numerico_por_modalidad(modalidad_id):
        return RequisitoModalidad.objects.filter(modalidad_id=modalidad_id, valor_numerico__isnull=False)

    @staticmethod
    def listar_con_valor_booleano_por_modalidad(modalidad_id):
        return RequisitoModalidad.objects.filter(modalidad_id=modalidad_id, valor_booleano__isnull=False)