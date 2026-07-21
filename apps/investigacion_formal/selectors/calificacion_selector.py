from apps.investigacion_formal.models import Calificacion


class CalificacionSelector:

    @staticmethod
    def listar():
        return Calificacion.objects.select_related('fase', 'aplicar').all()

    @staticmethod
    def obtener(calificacion_id):
        return Calificacion.objects.select_related('fase', 'aplicar').get(pk=calificacion_id)

    @staticmethod
    def buscar(calificacion_id):
        return (
            Calificacion.objects
            .select_related('fase', 'aplicar')
            .filter(pk=calificacion_id)
            .first()
        )

    @staticmethod
    def existe(calificacion_id):
        return Calificacion.objects.filter(pk=calificacion_id).exists()

    @staticmethod
    def listar_por_proyecto_x_convocatoria(aplicar_id):
        return (
            Calificacion.objects
            .select_related('fase')
            .filter(aplicar_id=aplicar_id)
            .order_by('fase__ordenFase')
        )

    @staticmethod
    def obtener_por_fase_y_aplicar(fase_id, aplicar_id):
        return (
            Calificacion.objects
            .select_related('fase', 'aplicar')
            .filter(fase_id=fase_id, aplicar_id=aplicar_id)
            .first()
        )

    @staticmethod
    def existe_calificacion(fase_id, aplicar_id, excluir_id=None):
        qs = Calificacion.objects.filter(fase_id=fase_id, aplicar_id=aplicar_id)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_pendientes_por_aplicar(aplicar_id):
        return (
            Calificacion.objects
            .select_related('fase')
            .filter(aplicar_id=aplicar_id, aprobado=False, observacion='')
            .order_by('fase__ordenFase')
        )

    @staticmethod
    def listar_aprobadas_por_aplicar(aplicar_id):
        return (
            Calificacion.objects
            .select_related('fase')
            .filter(aplicar_id=aplicar_id, aprobado=True)
            .order_by('fase__ordenFase')
        )

    @staticmethod
    def listar_no_aprobadas_por_aplicar(aplicar_id):
        return (
            Calificacion.objects
            .select_related('fase')
            .filter(aplicar_id=aplicar_id, aprobado=False)
            .order_by('fase__ordenFase')
        )

    @staticmethod
    def listar_primer_sin_observacion(aplicar_id=None):
        qs = Calificacion.objects.select_related('fase', 'aplicar').filter(
            primer_sin_observacion=True
        )
        if aplicar_id is not None:
            qs = qs.filter(aplicar_id=aplicar_id)
        return qs

    @staticmethod
    def contar_fases_calificadas(aplicar_id):
        return Calificacion.objects.filter(
            aplicar_id=aplicar_id, aprobado=True
        ).count()

    @staticmethod
    def todas_las_fases_aprobadas(aplicar_id, total_fases):
        return (
            Calificacion.objects
            .filter(aplicar_id=aplicar_id, aprobado=True)
            .count() == total_fases
        )