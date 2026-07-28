from django.db import transaction

from apps.investigacion_formativa.models import ProcesoFormativo
from apps.investigacion_formativa.selectors.proceso_formativo_selector import (
    ProcesoFormativoSelector,
)
from apps.investigacion_formativa.validators.proceso_formativo_validator import (
    ProcesoFormativoValidator,
)
from apps.common.services.historial_service import HistorialService


class ProcesoFormativoService:

    @staticmethod
    def listar():
        return ProcesoFormativoSelector.listar()

    @staticmethod
    def obtener(proceso_id):
        return ProcesoFormativoSelector.obtener(proceso_id)

    @staticmethod
    def listar_activos():
        return ProcesoFormativoSelector.listar_activos()

    @staticmethod
    def listar_por_persona(persona_id):
        return ProcesoFormativoSelector.listar_por_persona(persona_id)

    @staticmethod
    @transaction.atomic
    def crear(flujo_version_id, titulo, observacion, fecha_inicio, fecha_fin, ejecutor,
              idea_id=None, entidad_externa_id=None, palabras_clave=None,
              requiere_sustentacion=False, permite_segunda_instancia=False):
        ProcesoFormativoValidator.validar_creacion(
            flujo_version_id, titulo, observacion, fecha_inicio, fecha_fin,
            idea_id, entidad_externa_id, palabras_clave,
            requiere_sustentacion, permite_segunda_instancia,
        )
        proceso = ProcesoFormativo.objects.create(
            flujo_version_id=flujo_version_id,
            titulo=titulo,
            observacion=observacion,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            idea_id=idea_id,
            entidad_externa_id=entidad_externa_id,
            palabras_clave=palabras_clave,
            requiere_sustentacion=requiere_sustentacion,
            permite_segunda_instancia=permite_segunda_instancia,
        )
        HistorialService.registrar(
            ejecutor,
            f"Se creó el proceso formativo '{proceso.titulo}' (id={proceso.pk}).",
            objeto=proceso,
        )
        return proceso

    @staticmethod
    @transaction.atomic
    def actualizar(proceso_id, titulo, observacion, fecha_inicio, fecha_fin, ejecutor, palabras_clave=None):
        proceso = ProcesoFormativoSelector.obtener(proceso_id)
        ProcesoFormativoValidator.validar_actualizacion(
            proceso, titulo, observacion, fecha_inicio, fecha_fin, palabras_clave
        )
        proceso.titulo = titulo
        proceso.observacion = observacion
        proceso.fecha_inicio = fecha_inicio
        proceso.fecha_fin = fecha_fin
        proceso.palabras_clave = palabras_clave
        proceso.save(update_fields=[
            'titulo', 'observacion', 'fecha_inicio', 'fecha_fin', 'palabras_clave',
        ])
        HistorialService.registrar(
            ejecutor,
            f"Se actualizó el proceso formativo '{proceso.titulo}' (id={proceso.pk}).",
            objeto=proceso,
        )
        return proceso

    @staticmethod
    @transaction.atomic
    def calificar(proceso_id, aprobado, ejecutor, nota_final=None):
        proceso = ProcesoFormativoSelector.obtener(proceso_id)
        ProcesoFormativoValidator.validar_calificacion(proceso, aprobado, nota_final)
        proceso.aprobado = aprobado
        proceso.nota_final = nota_final
        proceso.save(update_fields=['aprobado', 'nota_final'])
        resultado = "aprobado" if aprobado else "reprobado"
        HistorialService.registrar(
            ejecutor,
            f"El proceso formativo '{proceso.titulo}' fue calificado como {resultado} "
            f"(nota={nota_final}, id={proceso.pk}).",
            objeto=proceso,
        )
        return proceso

    @staticmethod
    @transaction.atomic
    def activar_segunda_instancia(proceso_id, ejecutor):
        """Reabre la calificación del proceso para una segunda instancia.
        La creación del registro de auditoría de la segunda instancia en sí
        (SegundaInstancia) se hace por separado con SegundaInstanciaService.crear,
        que exige datos propios de esa instancia (evaluación, etapa de retorno, etc.)."""
        proceso = ProcesoFormativoSelector.obtener(proceso_id)
        ProcesoFormativoValidator.validar_activacion_segunda_instancia(proceso)
        proceso.aprobado = None
        proceso.save(update_fields=['aprobado'])
        HistorialService.registrar(
            ejecutor,
            f"Se reabrió la calificación del proceso formativo '{proceso.titulo}' "
            f"por activación de segunda instancia (id={proceso.pk}).",
            objeto=proceso,
        )
        return proceso

    @staticmethod
    @transaction.atomic
    def eliminar(proceso_id, ejecutor):
        proceso = ProcesoFormativoSelector.obtener(proceso_id)
        ProcesoFormativoValidator.validar_eliminacion(proceso)
        proceso.activo = False
        proceso.save(update_fields=['activo'])
        HistorialService.registrar(
            ejecutor,
            f"Se desactivó (soft-delete) el proceso formativo '{proceso.titulo}' (id={proceso.pk}).",
            objeto=proceso,
        )
        return proceso