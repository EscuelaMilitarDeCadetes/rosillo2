# apps/investigacion_formativa/services/estadisticas_service.py

from apps.investigacion_formativa.selectors.estadisticas_selector import EstadisticasSelector


class EstadisticasService:
    """Capa de solo lectura: envuelve EstadisticasSelector sin mutar estado,
    igual que EstadisticasService de investigacion_formal (sin @transaction.atomic
    ni HistorialService.registrar, porque no escribe nada)."""

    @staticmethod
    def procesos_por_anio(modalidad_id=None, facultad_id=None):
        return list(EstadisticasSelector.procesos_por_anio(
            modalidad_id=modalidad_id, facultad_id=facultad_id
        ))

    @staticmethod
    def procesos_por_modalidad(facultad_id=None):
        return list(EstadisticasSelector.procesos_por_modalidad(facultad_id=facultad_id))

    @staticmethod
    def aprobados_vs_reprobados_por_anio(modalidad_id=None, facultad_id=None):
        return list(EstadisticasSelector.aprobados_vs_no_aprobados_por_anio(
            modalidad_id=modalidad_id, facultad_id=facultad_id
        ))

    @staticmethod
    def tasa_aprobacion_por_modalidad(facultad_id=None):
        return EstadisticasSelector.tasa_aprobacion_por_modalidad(facultad_id=facultad_id)

    @staticmethod
    def promedio_horas_acumuladas_por_modalidad(facultad_id=None):
        return list(EstadisticasSelector.promedio_horas_acumuladas_por_modalidad(facultad_id=facultad_id))

    @staticmethod
    def distribucion_estado_actual(modalidad_id=None, facultad_id=None):
        """Cantidad de procesos agrupados por su estado_actual (PENDIENTE/EN_PROCESO/
        APROBADO/RECHAZADO/SEGUNDA_INSTANCIA), leído desde InstanciaEtapa."""
        return EstadisticasSelector.distribucion_estado_actual(
            modalidad_id=modalidad_id, facultad_id=facultad_id
        )