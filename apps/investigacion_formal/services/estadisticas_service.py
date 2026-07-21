# apps/investigacion_formal/services/estadisticas_service.py — reemplazar archivo completo
from apps.investigacion_formal.selectors.estadisticas_selector import EstadisticasSelector
from apps.investigacion_formal.services.avance_service import AvanceService


class EstadisticasService:

    @staticmethod
    def proyectos_por_anio(interno=None, facultad_id=None, grupo_id=None):
        return list(EstadisticasSelector.proyectos_por_anio(
            interno=interno, facultad_id=facultad_id, grupo_id=grupo_id
        ))

    @staticmethod
    def finalizados_vs_en_ejecucion_por_anio(interno=None, facultad_id=None, grupo_id=None):
        return list(EstadisticasSelector.finalizados_vs_en_ejecucion_por_anio(
            interno=interno, facultad_id=facultad_id, grupo_id=grupo_id
        ))

    @staticmethod
    def ejecucion_presupuestal_promedio_por_anio(interno=None, facultad_id=None, grupo_id=None):
        return list(EstadisticasSelector.ejecucion_presupuestal_promedio_por_anio(
            interno=interno, facultad_id=facultad_id, grupo_id=grupo_id
        ))

    @staticmethod
    def produccion_por_anio(interno=None, facultad_id=None, grupo_id=None):
        return list(EstadisticasSelector.produccion_por_anio(
            interno=interno, facultad_id=facultad_id, grupo_id=grupo_id
        ))

    @staticmethod
    def avance_ponderado_promedio_por_anio(interno=None, facultad_id=None, grupo_id=None):
        pares = EstadisticasSelector.proyectos_por_anio_para_avance(
            interno=interno, facultad_id=facultad_id, grupo_id=grupo_id
        )
        acumulado_por_anio = {}
        conteo_por_anio = {}
        for par in pares:
            anio = par['anio']
            avance = AvanceService.calcular_avance_ponderado(par['id'])
            acumulado_por_anio[anio] = acumulado_por_anio.get(anio, 0) + avance
            conteo_por_anio[anio] = conteo_por_anio.get(anio, 0) + 1
        return [
            {
                "anio": anio,
                "promedio_avance": round(acumulado_por_anio[anio] / conteo_por_anio[anio], 2),
            }
            for anio in sorted(acumulado_por_anio)
        ]