from apps.investigacion_formal.models import ControlCambios


class ControlCambiosSelector:

    @staticmethod
    def listar():
        return ControlCambios.objects.select_related('proyecto').all()

    @staticmethod
    def obtener(control_cambios_id):
        return ControlCambios.objects.select_related('proyecto').get(pk=control_cambios_id)

    @staticmethod
    def buscar(control_cambios_id):
        return (
            ControlCambios.objects
            .select_related('proyecto')
            .filter(pk=control_cambios_id)
            .first()
        )

    @staticmethod
    def existe(control_cambios_id):
        return ControlCambios.objects.filter(pk=control_cambios_id).exists()

    @staticmethod
    def listar_por_proyecto(proyecto_id):
        return (
            ControlCambios.objects
            .filter(proyecto_id=proyecto_id)
            .order_by('-fecha_cambio')
        )

    @staticmethod
    def listar_por_tipo_cambio(tipo_cambio):
        return ControlCambios.objects.select_related('proyecto').filter(
            tipo_cambio__iexact=tipo_cambio
        )

    @staticmethod
    def listar_con_cambio_tiempo(proyecto_id=None):
        qs = ControlCambios.objects.select_related('proyecto').filter(cambio_tiempo=True)
        if proyecto_id is not None:
            qs = qs.filter(proyecto_id=proyecto_id)
        return qs

    @staticmethod
    def listar_con_cambio_investigador(proyecto_id=None):
        qs = ControlCambios.objects.select_related('proyecto').filter(cambio_investigador=True)
        if proyecto_id is not None:
            qs = qs.filter(proyecto_id=proyecto_id)
        return qs

    @staticmethod
    def listar_con_cambio_costo(proyecto_id=None):
        qs = ControlCambios.objects.select_related('proyecto').filter(cambio_costo=True)
        if proyecto_id is not None:
            qs = qs.filter(proyecto_id=proyecto_id)
        return qs

    @staticmethod
    def listar_con_cambio_producto(proyecto_id=None):
        qs = ControlCambios.objects.select_related('proyecto').filter(cambio_producto=True)
        if proyecto_id is not None:
            qs = qs.filter(proyecto_id=proyecto_id)
        return qs

    @staticmethod
    def listar_por_rango_fechas(proyecto_id, fecha_inicio, fecha_fin):
        return (
            ControlCambios.objects
            .filter(
                proyecto_id=proyecto_id,
                fecha_cambio__range=(fecha_inicio, fecha_fin),
            )
            .order_by('-fecha_cambio')
        )