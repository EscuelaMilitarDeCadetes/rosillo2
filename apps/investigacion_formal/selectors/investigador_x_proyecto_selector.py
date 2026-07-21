from apps.investigacion_formal.models import InvestigadorXProyecto


class InvestigadorXProyectoSelector:

    @staticmethod
    def listar():
        return (
            InvestigadorXProyecto.objects
            .select_related('rol_investigador', 'proyecto', 'persona_x_grupo')
            .filter(estado=True)
        )

    @staticmethod
    def listar_historico():
        return (
            InvestigadorXProyecto.objects
            .select_related('rol_investigador', 'proyecto', 'persona_x_grupo')
            .all()
        )

    @staticmethod
    def obtener(investigador_x_proyecto_id):
        return (
            InvestigadorXProyecto.objects
            .select_related('rol_investigador', 'proyecto', 'persona_x_grupo')
            .get(pk=investigador_x_proyecto_id)
        )

    @staticmethod
    def buscar(investigador_x_proyecto_id):
        return (
            InvestigadorXProyecto.objects
            .select_related('rol_investigador', 'proyecto', 'persona_x_grupo')
            .filter(pk=investigador_x_proyecto_id)
            .first()
        )

    @staticmethod
    def existe(investigador_x_proyecto_id):
        return InvestigadorXProyecto.objects.filter(pk=investigador_x_proyecto_id).exists()

    @staticmethod
    def listar_por_proyecto(proyecto_id, solo_activos=True):
        qs = (
            InvestigadorXProyecto.objects
            .select_related('rol_investigador', 'persona_x_grupo')
            .filter(proyecto_id=proyecto_id)
        )
        if solo_activos:
            qs = qs.filter(estado=True)
        return qs

    @staticmethod
    def listar_por_persona_x_grupo(persona_x_grupo_id, solo_activos=True):
        qs = (
            InvestigadorXProyecto.objects
            .select_related('rol_investigador', 'proyecto')
            .filter(persona_x_grupo_id=persona_x_grupo_id)
        )
        if solo_activos:
            qs = qs.filter(estado=True)
        return qs

    @staticmethod
    def listar_por_rol_investigador(rol_investigador_id, solo_activos=True):
        qs = (
            InvestigadorXProyecto.objects
            .select_related('proyecto', 'persona_x_grupo')
            .filter(rol_investigador_id=rol_investigador_id)
        )
        if solo_activos:
            qs = qs.filter(estado=True)
        return qs

    @staticmethod
    def obtener_por_combinacion(rol_investigador_id, proyecto_id, persona_x_grupo_id):
        return InvestigadorXProyecto.objects.filter(
            rol_investigador_id=rol_investigador_id,
            proyecto_id=proyecto_id,
            persona_x_grupo_id=persona_x_grupo_id,
        ).first()

    @staticmethod
    def existe_vinculacion(rol_investigador_id, proyecto_id, persona_x_grupo_id, excluir_id=None):
        qs = InvestigadorXProyecto.objects.filter(
            rol_investigador_id=rol_investigador_id,
            proyecto_id=proyecto_id,
            persona_x_grupo_id=persona_x_grupo_id,
        )
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def existe_vinculacion_activa(persona_x_grupo_id, proyecto_id):
        return InvestigadorXProyecto.objects.filter(
            persona_x_grupo_id=persona_x_grupo_id,
            proyecto_id=proyecto_id,
            estado=True,
        ).exists()