from apps.investigacion_formativa.models import PostulacionProceso


class PostulacionProcesoSelector:

    @staticmethod
    def listar():
        return (
            PostulacionProceso.objects
            .select_related('estudiante__persona', 'modalidad__facultad', 'modalidad__modalidad', 'proceso_creado')
            .all()
        )

    @staticmethod
    def obtener(postulacion_id):
        return (
            PostulacionProceso.objects
            .select_related('estudiante__persona', 'modalidad__facultad', 'modalidad__modalidad', 'proceso_creado')
            .get(pk=postulacion_id)
        )

    @staticmethod
    def buscar(postulacion_id):
        return (
            PostulacionProceso.objects
            .select_related('estudiante__persona', 'modalidad__facultad', 'modalidad__modalidad', 'proceso_creado')
            .filter(pk=postulacion_id)
            .first()
        )

    @staticmethod
    def existe(postulacion_id):
        return PostulacionProceso.objects.filter(pk=postulacion_id).exists()

    @staticmethod
    def listar_por_estudiante(estudiante_id):
        return (
            PostulacionProceso.objects
            .select_related('modalidad__facultad', 'modalidad__modalidad', 'proceso_creado')
            .filter(estudiante_id=estudiante_id)
            .order_by('-fecha_postulacion')
        )

    @staticmethod
    def listar_por_modalidad(modalidad_id):
        return (
            PostulacionProceso.objects
            .select_related('estudiante__persona')
            .filter(modalidad_id=modalidad_id)
        )

    @staticmethod
    def obtener_por_estudiante_y_modalidad(estudiante_id, modalidad_id):
        return (
            PostulacionProceso.objects
            .select_related('proceso_creado')
            .filter(estudiante_id=estudiante_id, modalidad_id=modalidad_id)
            .first()
        )

    @staticmethod
    def existe_postulacion(estudiante_id, modalidad_id, excluir_id=None):
        qs = PostulacionProceso.objects.filter(estudiante_id=estudiante_id, modalidad_id=modalidad_id)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_por_estado(estado):
        return (
            PostulacionProceso.objects
            .select_related('estudiante__persona', 'modalidad__modalidad')
            .filter(estado=estado)
            .order_by('-fecha_postulacion')
        )

    @staticmethod
    def listar_borrador():
        return PostulacionProceso.objects.filter(estado='BORRADOR')

    @staticmethod
    def listar_enviadas():
        return (
            PostulacionProceso.objects
            .select_related('estudiante__persona', 'modalidad__modalidad')
            .filter(estado='ENVIADA')
            .order_by('fecha_postulacion')
        )

    @staticmethod
    def listar_en_validacion():
        return (
            PostulacionProceso.objects
            .select_related('estudiante__persona', 'modalidad__modalidad')
            .filter(estado='EN_VALIDACION')
            .order_by('fecha_postulacion')
        )

    @staticmethod
    def listar_aprobadas():
        return (
            PostulacionProceso.objects
            .select_related('estudiante__persona', 'modalidad__modalidad', 'proceso_creado')
            .filter(estado='APROBADA')
            .order_by('-fecha_decision')
        )

    @staticmethod
    def listar_rechazadas():
        return (
            PostulacionProceso.objects
            .select_related('estudiante__persona', 'modalidad__modalidad')
            .filter(estado='RECHAZADA')
            .order_by('-fecha_decision')
        )

    @staticmethod
    def obtener_por_proceso_creado(proceso_id):
        return (
            PostulacionProceso.objects
            .select_related('estudiante__persona')
            .filter(proceso_creado_id=proceso_id)
            .first()
        )

    @staticmethod
    def listar_pendientes_por_facultad(facultad_id):
        """Postulaciones ENVIADA o EN_VALIDACION cuya modalidad pertenece a la facultad dada."""
        return (
            PostulacionProceso.objects
            .select_related('estudiante__persona', 'modalidad__modalidad')
            .filter(modalidad__facultad_id=facultad_id, estado__in=['ENVIADA', 'EN_VALIDACION'])
            .order_by('fecha_postulacion')
        )
    
    @staticmethod
    def obtener_ultima_aprobada(estudiante_id):
        """Última postulación APROBADA de un estudiante (con su proceso
        creado), para decidir si puede volver a postular a otra modalidad."""
        return (
            PostulacionProceso.objects
            .filter(estudiante_id=estudiante_id, estado='APROBADA')
            .select_related('proceso_creado')
            .order_by('-fecha_decision')
            .first()
        )