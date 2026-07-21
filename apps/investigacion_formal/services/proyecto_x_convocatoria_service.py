from django.db import transaction

from apps.investigacion_formal.models import ProyectoXConvocatoria
from apps.investigacion_formal.selectors.proyecto_x_convocatoria_selector import (
    ProyectoXConvocatoriaSelector,
)
from apps.investigacion_formal.validators.proyecto_x_convocatoria_validator import (
    ProyectoXConvocatoriaValidator,
)
from apps.common.services.historial_service import HistorialService


class ProyectoXConvocatoriaService:

    @staticmethod
    def listar():
        return ProyectoXConvocatoriaSelector.listar()

    @staticmethod
    def obtener(proyecto_x_convocatoria_id):
        return ProyectoXConvocatoriaSelector.obtener(proyecto_x_convocatoria_id)

    @staticmethod
    def listar_por_proyecto(proyecto_id):
        return ProyectoXConvocatoriaSelector.listar_por_proyecto(proyecto_id)

    @staticmethod
    def listar_por_convocatoria(convocatoria_id):
        return ProyectoXConvocatoriaSelector.listar_por_convocatoria(convocatoria_id)

    @staticmethod
    def listar_sin_calificar():
        return ProyectoXConvocatoriaSelector.listar_sin_calificar()

    @staticmethod
    def listar_calificados(calificacion=None):
        return ProyectoXConvocatoriaSelector.listar_calificados(calificacion=calificacion)

    @staticmethod
    def listar_por_facultad(facultad_id):
        return ProyectoXConvocatoriaSelector.listar_por_facultad(facultad_id)

    @staticmethod
    def listar_por_grupo(grupo_id):
        return ProyectoXConvocatoriaSelector.listar_por_grupo(grupo_id)

    @staticmethod
    @transaction.atomic
    def crear(convocatoria_id, proyecto_id, ejecutor):
        """Réplica de participarConvocatoria: FACULTAD/GRUPO postulan un
        proyecto ya creado a una convocatoria activa."""
        from django.utils import timezone

        ProyectoXConvocatoriaValidator.validar_creacion(convocatoria_id, proyecto_id)
        vinculo = ProyectoXConvocatoria.objects.create(
            convocatoria_id=convocatoria_id,
            proyecto_id=proyecto_id,
            estado=True,
            fecha_crea=timezone.now().date(),
        )
        HistorialService.registrar(
            ejecutor,
            f"Se postuló el proyecto '{vinculo.proyecto.titulo}' a la "
            f"convocatoria '{vinculo.convocatoria.nombre_convocatoria}' "
            f"(id={vinculo.pk}).",
            objeto=vinculo,
        )
        return vinculo

    @staticmethod
    @transaction.atomic
    def habilitar_correccion(proyecto_x_convocatoria_id, ejecutor):
        """Réplica de habilitarCorreccionDoc; exclusivo de CINTERNO/CEXTERNO."""
        vinculo = ProyectoXConvocatoriaSelector.obtener(proyecto_x_convocatoria_id)
        ProyectoXConvocatoriaValidator.validar_habilitar_correccion(vinculo)
        vinculo.modificacion_documento_proyecto = True
        vinculo.save(update_fields=['modificacion_documento_proyecto'])
        HistorialService.registrar(
            ejecutor,
            f"Se habilitó la corrección de documentos del proyecto "
            f"'{vinculo.proyecto.titulo}' en la convocatoria "
            f"'{vinculo.convocatoria.nombre_convocatoria}' (id={vinculo.pk}).",
            objeto=vinculo,
        )
        return vinculo

    @staticmethod
    @transaction.atomic
    def deshabilitar_correccion(proyecto_x_convocatoria_id, ejecutor):
        """Réplica de desHabilitarCorreccionDoc."""
        vinculo = ProyectoXConvocatoriaSelector.obtener(proyecto_x_convocatoria_id)
        ProyectoXConvocatoriaValidator.validar_deshabilitar_correccion(vinculo)
        vinculo.modificacion_documento_proyecto = False
        vinculo.save(update_fields=['modificacion_documento_proyecto'])
        HistorialService.registrar(
            ejecutor,
            f"Se deshabilitó la corrección de documentos del proyecto "
            f"'{vinculo.proyecto.titulo}' en la convocatoria "
            f"'{vinculo.convocatoria.nombre_convocatoria}' (id={vinculo.pk}).",
            objeto=vinculo,
        )
        return vinculo

    @staticmethod
    @transaction.atomic
    def finalizar_calificacion(proyecto_x_convocatoria_id, aprobado, ejecutor):
        """Marca la calificación de las 6 fases como finalizada, en línea con lo
        que CalificacionService.calificar_fase ya deja en estado_finalizado_calificacion,
        para casos donde se requiera forzar el cierre manualmente."""
        vinculo = ProyectoXConvocatoriaSelector.obtener(proyecto_x_convocatoria_id)
        ProyectoXConvocatoriaValidator.validar_finalizar_calificacion(vinculo, aprobado)

        vinculo.estado_finalizado_calificacion = True
        vinculo.calificacion_ultimo_filtro_calificacion = (
            'APROBADO' if aprobado else 'NO_APROBADO'
        )
        vinculo.save(update_fields=[
            'estado_finalizado_calificacion', 'calificacion_ultimo_filtro_calificacion',
        ])

        proyecto = vinculo.proyecto
        proyecto.estado_aprobado = 'APROBADO' if aprobado else 'NO_APROBADO'
        proyecto.save(update_fields=['estado_aprobado'])

        HistorialService.registrar(
            ejecutor,
            f"Se finalizó la calificación del proyecto '{vinculo.proyecto.titulo}' "
            f"en la convocatoria '{vinculo.convocatoria.nombre_convocatoria}' "
            f"como {'APROBADO' if aprobado else 'NO APROBADO'}.",
            objeto=vinculo,
        )
        return vinculo

    @staticmethod
    @transaction.atomic
    def eliminar(proyecto_x_convocatoria_id, ejecutor):
        """Soft-delete; exclusivo de CINTERNO/CEXTERNO."""
        vinculo = ProyectoXConvocatoriaSelector.obtener(proyecto_x_convocatoria_id)
        ProyectoXConvocatoriaValidator.validar_eliminacion(vinculo)
        vinculo.estado = False
        vinculo.save(update_fields=['estado'])
        HistorialService.registrar(
            ejecutor,
            f"Se desactivó la participación del proyecto "
            f"'{vinculo.proyecto.titulo}' en la convocatoria "
            f"'{vinculo.convocatoria.nombre_convocatoria}' (id={vinculo.pk}).",
            objeto=vinculo,
        )
        return vinculo