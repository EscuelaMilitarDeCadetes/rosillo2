from apps.investigacion_formal.models import Proyecto


class ProyectoSelector:

    @staticmethod
    def listar():
        return Proyecto.objects.select_related('usuario', 'gerente').all()

    @staticmethod
    def obtener(proyecto_id):
        return Proyecto.objects.select_related('usuario', 'gerente').get(pk=proyecto_id)

    @staticmethod
    def buscar(proyecto_id):
        return (
            Proyecto.objects
            .select_related('usuario', 'gerente')
            .filter(pk=proyecto_id)
            .first()
        )

    @staticmethod
    def existe(proyecto_id):
        return Proyecto.objects.filter(pk=proyecto_id).exists()

    @staticmethod
    def obtener_por_titulo(titulo):
        return Proyecto.objects.filter(titulo__iexact=titulo).first()

    @staticmethod
    def existe_titulo(titulo, excluir_id=None):
        qs = Proyecto.objects.filter(titulo__iexact=titulo)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def obtener_por_codigo(codigo):
        return Proyecto.objects.filter(codigo__iexact=codigo).first()

    @staticmethod
    def listar_por_usuario(usuario_id):
        return Proyecto.objects.select_related('gerente').filter(usuario_id=usuario_id)

    @staticmethod
    def listar_activos():
        return Proyecto.objects.select_related('usuario', 'gerente').filter(estado=True)

    @staticmethod
    def listar_por_estado_aprobado(estado_aprobado):
        """estado_aprobado: 'SIN_CALIFICAR' | 'APROBADO' | 'NO_APROBADO'."""
        return (
            Proyecto.objects
            .select_related('usuario', 'gerente')
            .filter(estado_aprobado=estado_aprobado)
        )

    @staticmethod
    def listar_internos(interno=True):
        return Proyecto.objects.select_related('usuario', 'gerente').filter(interno=interno)

    @staticmethod
    def listar_financiados():
        return Proyecto.objects.select_related('usuario', 'gerente').filter(financiado=True)

    @staticmethod
    def listar_con_gruplac():
        return Proyecto.objects.select_related('usuario', 'gerente').filter(gruplac=True)

    @staticmethod
    def listar_con_acta_cierre():
        return Proyecto.objects.filter(registro_acta_cierre=True)

    @staticmethod
    def listar_por_gerente(gerente_id):
        return Proyecto.objects.select_related('usuario').filter(gerente_id=gerente_id)

    @staticmethod
    def listar_por_facultad(facultad_id):
        """Vía usuario -> asignación activa -> persona -> vinculación activa a facultad."""
        return (
            Proyecto.objects
            .select_related('usuario', 'gerente')
            .filter(
                usuario__asignaciones__estado=True,
                usuario__asignaciones__persona__personaxgrupo__estado=True,
                usuario__asignaciones__persona__personaxgrupo__facultad_id=facultad_id,
            )
            .distinct()
        )

    @staticmethod
    def listar_por_grupo(grupo_id):
        """Vía usuario -> asignación activa -> persona -> vinculación activa a grupo."""
        return (
            Proyecto.objects
            .select_related('usuario', 'gerente')
            .filter(
                usuario__asignaciones__estado=True,
                usuario__asignaciones__persona__personaxgrupo__estado=True,
                usuario__asignaciones__persona__personaxgrupo__grupo_id=grupo_id,
            )
            .distinct()
        )

    @staticmethod
    def contar_aprobados_por_prefijo_codigo(prefijo_codigo):
        """Equivalente a countProyectosAprobadosByPrefijo, usado para consecutivo de código."""
        return Proyecto.objects.filter(
            codigo__startswith=prefijo_codigo, estado_aprobado='APROBADO'
        ).count()

    @staticmethod
    def listar_anios_inicio_distintos():
        return (
            Proyecto.objects
            .filter(fecha_inicio__isnull=False)
            .dates('fecha_inicio', 'year', order='DESC')
        )

    @staticmethod
    def listar_anios_fin_distintos():
        return (
            Proyecto.objects
            .filter(fecha_fin__isnull=False)
            .dates('fecha_fin', 'year', order='DESC')
        )

    @staticmethod
    def _base_proyectos_calificados(interno=True):
        return Proyecto.objects.filter(
            interno=interno,
            estado_aprobado='APROBADO',
            proyectoxconvocatoria__estado_finalizado_calificacion=True,
        ).distinct()

    @staticmethod
    def listar_anios_inicio_proyectos_calificados(interno=True):
        return (
            ProyectoSelector._base_proyectos_calificados(interno)
            .filter(fecha_inicio__isnull=False)
            .dates('fecha_inicio', 'year', order='DESC')
        )

    @staticmethod
    def listar_anios_fin_proyectos_calificados(interno=True):
        return (
            ProyectoSelector._base_proyectos_calificados(interno)
            .filter(fecha_fin__isnull=False)
            .dates('fecha_fin', 'year', order='DESC')
        )

    @staticmethod
    def listar_anios_inicio_por_facultad(facultad_id):
        return (
            ProyectoSelector.listar_por_facultad(facultad_id)
            .filter(fecha_inicio__isnull=False)
            .dates('fecha_inicio', 'year', order='DESC')
        )

    @staticmethod
    def listar_anios_inicio_por_grupo(grupo_id):
        return (
            ProyectoSelector.listar_por_grupo(grupo_id)
            .filter(fecha_inicio__isnull=False)
            .dates('fecha_inicio', 'year', order='DESC')
        )
    
    @staticmethod
    def contar_aprobados_por_prefijo(prefijo):
        """
        Cuenta proyectos APROBADO cuyo código empieza exactamente por `prefijo`
        (p.ej. 'ING2024-I'), para calcular el consecutivo de dos dígitos.
        OJO: aquí sí es correcto usar codigo__startswith porque `prefijo` es
        literal, no un patrón LIKE con comodines.
        """
        return Proyecto.objects.filter(
            codigo__startswith=prefijo, estado_aprobado='APROBADO'
        ).count()

    @staticmethod
    def existe_codigo(codigo, excluir_id=None):
        qs = Proyecto.objects.filter(codigo=codigo)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()