# apps/investigacion_formativa/validators/homologacion_validator.py

from rest_framework.exceptions import ValidationError

from apps.investigacion_formativa.selectors.homologacion_selector import HomologacionSelector

ESTADOS_VALIDOS = ('PENDIENTE', 'APROBADA', 'RECHAZADA')


class HomologacionValidator:

    @staticmethod
    def validar_creacion(proceso_id, observaciones=None):
        """Se crea automáticamente en estado PENDIENTE al iniciar un proceso en una
        modalidad que permite_homologacion."""
        HomologacionValidator._validar_unicidad_proceso(proceso_id)

    @staticmethod
    def validar_aprobacion(homologacion, aprobado_por_id, creditos_reconocidos, acta_homologacion_id):
        HomologacionValidator._validar_pendiente(homologacion)
        if not aprobado_por_id:
            raise ValidationError({"aprobado_por_id": "Debe indicar quién aprueba la homologación."})
        HomologacionValidator._validar_creditos_reconocidos(creditos_reconocidos)

    @staticmethod
    def validar_rechazo(homologacion, observaciones):
        HomologacionValidator._validar_pendiente(homologacion)
        if not observaciones or not observaciones.strip():
            raise ValidationError(
                {"observaciones": "Debe indicar el motivo del rechazo de la homologación."}
            )

    @staticmethod
    def validar_filtro_estado(estado):
        if estado not in ESTADOS_VALIDOS:
            raise ValidationError(
                {"estado": f"Estado inválido. Debe ser uno de: {', '.join(ESTADOS_VALIDOS)}."}
            )

    @staticmethod
    def _validar_pendiente(homologacion):
        if homologacion.estado != 'PENDIENTE':
            raise ValidationError(
                f"Solo se pueden resolver homologaciones en estado 'PENDIENTE'. Estado actual: '{homologacion.estado}'."
            )

    @staticmethod
    def _validar_creditos_reconocidos(creditos_reconocidos):
        if creditos_reconocidos is None:
            raise ValidationError(
                {"creditos_reconocidos": "Debe indicar los créditos académicos reconocidos al aprobar."}
            )
        try:
            valor = float(creditos_reconocidos)
        except (TypeError, ValueError):
            raise ValidationError({"creditos_reconocidos": "Los créditos reconocidos deben ser numéricos."})
        if valor <= 0:
            raise ValidationError({"creditos_reconocidos": "Los créditos reconocidos deben ser mayores a 0."})

    @staticmethod
    def _validar_unicidad_proceso(proceso_id):
        if HomologacionSelector.existe_para_proceso(proceso_id):
            raise ValidationError("Este proceso ya cuenta con una homologación registrada.")