# apps/investigacion_formal/selectors/estadisticas_selector.py — reemplazar archivo completo
from django.db.models import Count, Avg, Q
from django.db.models.functions import ExtractYear
from apps.investigacion_formal.models import Proyecto, Monto


def _filtrar_proyecto_por_facultad_grupo(qs, facultad_id=None, grupo_id=None):
    if facultad_id is not None:
        qs = qs.filter(
            usuario__asignaciones__estado=True,
            usuario__asignaciones__persona__personaxgrupo__estado=True,
            usuario__asignaciones__persona__personaxgrupo__facultad_id=facultad_id,
        )
    if grupo_id is not None:
        qs = qs.filter(
            usuario__asignaciones__estado=True,
            usuario__asignaciones__persona__personaxgrupo__estado=True,
            usuario__asignaciones__persona__personaxgrupo__grupo_id=grupo_id,
        )
    return qs.distinct()


def _filtrar_monto_por_facultad_grupo(qs, facultad_id=None, grupo_id=None):
    if facultad_id is not None:
        qs = qs.filter(
            proyecto__usuario__asignaciones__estado=True,
            proyecto__usuario__asignaciones__persona__personaxgrupo__estado=True,
            proyecto__usuario__asignaciones__persona__personaxgrupo__facultad_id=facultad_id,
        )
    if grupo_id is not None:
        qs = qs.filter(
            proyecto__usuario__asignaciones__estado=True,
            proyecto__usuario__asignaciones__persona__personaxgrupo__estado=True,
            proyecto__usuario__asignaciones__persona__personaxgrupo__grupo_id=grupo_id,
        )
    return qs.distinct()


class EstadisticasSelector:

    @staticmethod
    def proyectos_por_anio(interno=None, facultad_id=None, grupo_id=None):
        qs = Proyecto.objects.filter(fecha_inicio__isnull=False)
        if interno is not None:
            qs = qs.filter(interno=interno)
        qs = _filtrar_proyecto_por_facultad_grupo(qs, facultad_id, grupo_id)
        return (
            qs.annotate(anio=ExtractYear('fecha_inicio'))
            .values('anio')
            .annotate(total=Count('id'))
            .order_by('anio')
        )

    @staticmethod
    def finalizados_vs_en_ejecucion_por_anio(interno=None, facultad_id=None, grupo_id=None):
        qs = Proyecto.objects.filter(fecha_inicio__isnull=False)
        if interno is not None:
            qs = qs.filter(interno=interno)
        qs = _filtrar_proyecto_por_facultad_grupo(qs, facultad_id, grupo_id)
        return (
            qs.annotate(anio=ExtractYear('fecha_inicio'))
            .values('anio')
            .annotate(
                finalizados=Count('id', filter=Q(registro_acta_cierre=True)),
                en_ejecucion=Count('id', filter=Q(registro_acta_cierre=False)),
            )
            .order_by('anio')
        )

    @staticmethod
    def ejecucion_presupuestal_promedio_por_anio(interno=None, facultad_id=None, grupo_id=None):
        qs = Monto.objects.filter(proyecto__fecha_inicio__isnull=False)
        if interno is not None:
            qs = qs.filter(proyecto__interno=interno)
        qs = _filtrar_monto_por_facultad_grupo(qs, facultad_id, grupo_id)
        return (
            qs.annotate(anio=ExtractYear('proyecto__fecha_inicio'))
            .values('anio')
            .annotate(promedio_ejecutado=Avg('ejecutado'))
            .order_by('anio')
        )

    @staticmethod
    def proyectos_por_anio_para_avance(interno=None, facultad_id=None, grupo_id=None):
        qs = Proyecto.objects.filter(fecha_inicio__isnull=False)
        if interno is not None:
            qs = qs.filter(interno=interno)
        qs = _filtrar_proyecto_por_facultad_grupo(qs, facultad_id, grupo_id)
        return list(
            qs.annotate(anio=ExtractYear('fecha_inicio')).values('anio', 'id')
        )

    @staticmethod
    def produccion_por_anio(interno=None, facultad_id=None, grupo_id=None):
        qs = Proyecto.objects.filter(fecha_inicio__isnull=False, registro_acta_cierre=True)
        if interno is not None:
            qs = qs.filter(interno=interno)
        qs = _filtrar_proyecto_por_facultad_grupo(qs, facultad_id, grupo_id)
        return (
            qs.annotate(anio=ExtractYear('fecha_inicio'))
            .values('anio')
            .annotate(total=Count('id'))
            .order_by('anio')
        )