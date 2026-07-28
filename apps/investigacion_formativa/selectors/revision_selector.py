from apps.investigacion_formativa.models import Revision


class RevisionSelector:

    @staticmethod
    def listar():
        return Revision.objects.select_related('instancia_etapa').all()

    @staticmethod
    def obtener(revision_id):
        return Revision.objects.select_related('instancia_etapa').get(pk=revision_id)

    @staticmethod
    def buscar(revision_id):
        return (
            Revision.objects
            .select_related('instancia_etapa')
            .filter(pk=revision_id)
            .first()
        )

    @staticmethod
    def existe(revision_id):
        return Revision.objects.filter(pk=revision_id).exists()

    @staticmethod
    def listar_por_instancia_etapa(instancia_etapa_id):
        return (
            Revision.objects
            .filter(instancia_etapa_id=instancia_etapa_id)
            .order_by('-version')
        )

    @staticmethod
    def obtener_por_instancia_y_version(instancia_etapa_id, version):
        return (
            Revision.objects
            .filter(instancia_etapa_id=instancia_etapa_id, version=version)
            .first()
        )

    @staticmethod
    def existe_version(instancia_etapa_id, version, excluir_id=None):
        qs = Revision.objects.filter(instancia_etapa_id=instancia_etapa_id, version=version)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def obtener_ultima_por_instancia_etapa(instancia_etapa_id):
        return (
            Revision.objects
            .filter(instancia_etapa_id=instancia_etapa_id)
            .order_by('-version')
            .first()
        )

    @staticmethod
    def listar_aprobadas_por_instancia_etapa(instancia_etapa_id):
        return (
            Revision.objects
            .filter(instancia_etapa_id=instancia_etapa_id, aprobado=True)
            .order_by('-version')
        )

    @staticmethod
    def listar_no_aprobadas_por_instancia_etapa(instancia_etapa_id):
        return (
            Revision.objects
            .filter(instancia_etapa_id=instancia_etapa_id, aprobado=False)
            .order_by('-version')
        )

    @staticmethod
    def contar_versiones_por_instancia_etapa(instancia_etapa_id):
        return Revision.objects.filter(instancia_etapa_id=instancia_etapa_id).count()