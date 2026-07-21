from django.db import transaction

from apps.investigacion_formal.models import Calificacion
from apps.investigacion_formal.selectors.calificacion_selector import CalificacionSelector
from apps.investigacion_formal.selectors.proyecto_x_convocatoria_selector import (
    ProyectoXConvocatoriaSelector,
)
from apps.investigacion_formal.validators.calificacion_validator import CalificacionValidator
from apps.common.services.historial_service import HistorialService


class CalificacionService:

    @staticmethod
    def listar():
        return CalificacionSelector.listar()

    @staticmethod
    def obtener(calificacion_id):
        return CalificacionSelector.obtener(calificacion_id)

    @staticmethod
    def listar_por_proyecto_x_convocatoria(aplicar_id):
        return CalificacionSelector.listar_por_proyecto_x_convocatoria(aplicar_id)

    @staticmethod
    @transaction.atomic
    def crear(fase_id, aplicar_id, ejecutor, observacion=''):
        CalificacionValidator.validar_creacion(fase_id, aplicar_id, observacion)
        es_primera_fase = not CalificacionSelector.listar_por_proyecto_x_convocatoria(
            aplicar_id
        ).exists()
        calificacion = Calificacion.objects.create(
            fase_id=fase_id,
            aplicar_id=aplicar_id,
            observacion=observacion or '',
            aprobado=False,
            primer_sin_observacion=es_primera_fase,
        )
        HistorialService.registrar(
            ejecutor,
            f"Se creó el registro de calificación para la fase id={fase_id} "
            f"del proyecto-convocatoria id={aplicar_id} (id={calificacion.pk}).",
            objeto=calificacion,
        )
        return calificacion

    @staticmethod
    @transaction.atomic
    def calificar_fase(calificacion_id, aprobado, observacion, ejecutor):
        """Réplica de CalificarControlador.ejecutarCalificionFase: registra el
        resultado de la fase, habilita la siguiente fase (primer_sin_observacion)
        y actualiza el estado agregado del ProyectoXConvocatoria."""
        calificacion = CalificacionSelector.obtener(calificacion_id)
        CalificacionValidator.validar_calificacion(observacion, aprobado)

        calificacion.aprobado = aprobado
        calificacion.observacion = observacion or ''
        calificacion.primer_sin_observacion = False
        calificacion.save(update_fields=['aprobado', 'observacion', 'primer_sin_observacion'])

        HistorialService.registrar(
            ejecutor,
            f"Se calificó la fase '{calificacion.fase.tipo_calificacion}' del proyecto "
            f"'{calificacion.aplicar.proyecto.titulo}' como "
            f"{'APROBADO' if aprobado else 'NO APROBADO'} (id={calificacion.pk}).",
            objeto=calificacion,
        )

        aplicar = calificacion.aplicar
        if not aprobado:
            aplicar.ultimo_filtro_calificacion = calificacion.fase.descripcion
            aplicar.calificacion_ultimo_filtro_calificacion = 'NO_APROBADO'
            aplicar.estado_finalizado_calificacion = True
            aplicar.save(update_fields=[
                'ultimo_filtro_calificacion',
                'calificacion_ultimo_filtro_calificacion',
                'estado_finalizado_calificacion',
            ])
            proyecto = aplicar.proyecto
            proyecto.estado_aprobado = 'NO_APROBADO'
            proyecto.save(update_fields=['estado_aprobado'])
        else:
            aplicar.ultimo_filtro_calificacion = calificacion.fase.descripcion
            aplicar.calificacion_ultimo_filtro_calificacion = 'APROBADO'

            siguiente = CalificacionSelector.listar_por_proyecto_x_convocatoria(
                aplicar.pk
            ).filter(fase__ordenFase__gt=calificacion.fase.ordenFase).order_by(
                'fase__ordenFase'
            ).first()
            if siguiente is not None and not siguiente.observacion:
                siguiente.primer_sin_observacion = True
                siguiente.save(update_fields=['primer_sin_observacion'])

            todas_calificadas = CalificacionSelector.contar_fases_calificadas(
                aplicar.pk
            ) == CalificacionSelector.listar_por_proyecto_x_convocatoria(aplicar.pk).count()
            if todas_calificadas:
                aplicar.estado_finalizado_calificacion = True
                proyecto = aplicar.proyecto
                proyecto.estado_aprobado = 'APROBADO'
                proyecto.save(update_fields=['estado_aprobado'])

            aplicar.save(update_fields=[
                'ultimo_filtro_calificacion',
                'calificacion_ultimo_filtro_calificacion',
                'estado_finalizado_calificacion',
            ])

        return calificacion