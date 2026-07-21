from django.db import transaction

from apps.investigacion_formal.models import Convocatoria
from apps.investigacion_formal.selectors.convocatoria_selector import ConvocatoriaSelector
from apps.investigacion_formal.validators.convocatoria_validator import ConvocatoriaValidator
from apps.common.services.historial_service import HistorialService


class ConvocatoriaService:

    @staticmethod
    def listar():
        return ConvocatoriaSelector.listar()

    @staticmethod
    def obtener(convocatoria_id):
        return ConvocatoriaSelector.obtener(convocatoria_id)

    @staticmethod
    def listar_activas():
        return ConvocatoriaSelector.listar_activas()

    @staticmethod
    def listar_internas(estado=None):
        return ConvocatoriaSelector.listar_internas(estado=estado)

    @staticmethod
    def listar_externas(estado=None):
        return ConvocatoriaSelector.listar_externas(estado=estado)

    @staticmethod
    @transaction.atomic
    def crear(nombre_convocatoria, anio_convocatoria, inicio, cierre, interno, ejecutor):
        """Creada exclusivamente por el rol ASESOR."""
        ConvocatoriaValidator.validar_creacion(
            nombre_convocatoria, anio_convocatoria, inicio, cierre, interno
        )
        convocatoria = Convocatoria.objects.create(
            nombre_convocatoria=nombre_convocatoria.strip(),
            anio_convocatoria=anio_convocatoria,
            inicio=inicio,
            cierre=cierre,
            interno=interno,
            estado=True,
        )
        HistorialService.registrar(
            ejecutor,
            f"Se creó la convocatoria '{convocatoria.nombre_convocatoria}' "
            f"({'interna' if interno else 'externa'}, id={convocatoria.pk}).",
            objeto=convocatoria,
        )
        return convocatoria

    @staticmethod
    @transaction.atomic
    def cambiar_estado(convocatoria_id, nuevo_estado, ejecutor):
        """Única modificación permitida sobre una convocatoria; realizada por CINTERNO.
        No se editan ni se borran convocatorias por ningún otro medio."""
        convocatoria = ConvocatoriaSelector.obtener(convocatoria_id)
        ConvocatoriaValidator.validar_cambio_estado(convocatoria, nuevo_estado)

        convocatoria.estado = nuevo_estado
        convocatoria.save(update_fields=['estado'])

        HistorialService.registrar(
            ejecutor,
            f"Se {'activó' if nuevo_estado else 'desactivó'} la convocatoria "
            f"'{convocatoria.nombre_convocatoria}' (id={convocatoria.pk}).",
            objeto=convocatoria,
        )
        return convocatoria