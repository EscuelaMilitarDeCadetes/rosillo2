from apps.investigacion_formativa.models import ProcesoFormativoXProyecto


class ProcesoFormativoXProyectoSelector:

    @staticmethod
    def listar():
        return (
            ProcesoFormativoXProyecto.objects
            .select_related('proceso_formativo', 'proyecto_formal')
            .all()
        )

    @staticmethod
    def obtener(vinculo_id):
        return (
            ProcesoFormativoXProyecto.objects
            .select_related('proceso_formativo', 'proyecto_formal')
            .get(pk=vinculo_id)
        )

    @staticmethod
    def buscar(vinculo_id):
        return (
            ProcesoFormativoXProyecto.objects
            .select_related('proceso_formativo', 'proyecto_formal')
            .filter(pk=vinculo_id)
            .first()
        )

    @staticmethod
    def existe(vinculo_id):
        return ProcesoFormativoXProyecto.objects.filter(pk=vinculo_id).exists()

    @staticmethod
    def listar_por_proceso_formativo(proceso_formativo_id):
        return (
            ProcesoFormativoXProyecto.objects
            .select_related('proyecto_formal')
            .filter(proceso_formativo_id=proceso_formativo_id)
        )

    @staticmethod
    def listar_por_proyecto_formal(proyecto_formal_id):
        return (
            ProcesoFormativoXProyecto.objects
            .select_related('proceso_formativo')
            .filter(proyecto_formal_id=proyecto_formal_id)
        )

    @staticmethod
    def obtener_por_proceso_y_proyecto(proceso_formativo_id, proyecto_formal_id):
        return (
            ProcesoFormativoXProyecto.objects
            .filter(proceso_formativo_id=proceso_formativo_id, proyecto_formal_id=proyecto_formal_id)
            .first()
        )

    @staticmethod
    def existe_combinacion(proceso_formativo_id, proyecto_formal_id, excluir_id=None):
        qs = ProcesoFormativoXProyecto.objects.filter(
            proceso_formativo_id=proceso_formativo_id,
            proyecto_formal_id=proyecto_formal_id,
        )
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()