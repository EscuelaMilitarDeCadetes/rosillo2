from apps.investigacion_formativa.models import PlanTrabajo


class PlanTrabajoSelector:

    @staticmethod
    def listar():
        return PlanTrabajo.objects.select_related('proceso', 'aprobado_por').all()

    @staticmethod
    def obtener(plan_trabajo_id):
        return (
            PlanTrabajo.objects
            .select_related('proceso', 'aprobado_por')
            .get(pk=plan_trabajo_id)
        )

    @staticmethod
    def buscar(plan_trabajo_id):
        return (
            PlanTrabajo.objects
            .select_related('proceso', 'aprobado_por')
            .filter(pk=plan_trabajo_id)
            .first()
        )

    @staticmethod
    def existe(plan_trabajo_id):
        return PlanTrabajo.objects.filter(pk=plan_trabajo_id).exists()

    @staticmethod
    def obtener_por_proceso(proceso_id):
        return (
            PlanTrabajo.objects
            .select_related('aprobado_por')
            .filter(proceso_id=proceso_id)
            .first()
        )

    @staticmethod
    def existe_para_proceso(proceso_id):
        return PlanTrabajo.objects.filter(proceso_id=proceso_id).exists()

    @staticmethod
    def listar_por_estado(estado):
        return (
            PlanTrabajo.objects
            .select_related('proceso')
            .filter(estado=estado)
        )

    @staticmethod
    def listar_borrador():
        return PlanTrabajo.objects.select_related('proceso').filter(estado='BORRADOR')

    @staticmethod
    def listar_enviados():
        return PlanTrabajo.objects.select_related('proceso').filter(estado='ENVIADO')

    @staticmethod
    def listar_aprobados():
        return (
            PlanTrabajo.objects
            .select_related('proceso', 'aprobado_por')
            .filter(estado='APROBADO')
        )

    @staticmethod
    def listar_rechazados():
        return PlanTrabajo.objects.select_related('proceso').filter(estado='RECHAZADO')

    @staticmethod
    def listar_por_aprobado_por(usuario_id):
        return (
            PlanTrabajo.objects
            .select_related('proceso')
            .filter(aprobado_por_id=usuario_id)
        )

    @staticmethod
    def listar_pendientes_aprobacion():
        return PlanTrabajo.objects.select_related('proceso').filter(estado='ENVIADO')

    @staticmethod
    def listar_vigentes_por_fecha(fecha):
        return (
            PlanTrabajo.objects
            .select_related('proceso')
            .filter(fecha_inicio_planeada__lte=fecha, fecha_fin_planeada__gte=fecha)
        )