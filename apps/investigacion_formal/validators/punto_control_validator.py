from rest_framework.exceptions import ValidationError

from apps.investigacion_formal.selectors.punto_control_selector import PuntoControlSelector


class PuntoControlValidator:

    @staticmethod
    def validar_creacion(control, peso):
        PuntoControlValidator._validar_control(control)
        PuntoControlValidator._validar_peso(peso)
        PuntoControlValidator._validar_unicidad(control)

    @staticmethod
    def validar_actualizacion(punto_control_id, control, peso):
        PuntoControlValidator._validar_control(control)
        PuntoControlValidator._validar_peso(peso)
        PuntoControlValidator._validar_unicidad(control, excluir_id=punto_control_id)

    @staticmethod
    def validar_actualizar_completado(completado):
        if completado is None:
            raise ValidationError({"completado": "El valor de completado es obligatorio."})
        try:
            valor = float(completado)
        except (TypeError, ValueError):
            raise ValidationError({"completado": "El valor de completado debe ser numérico."})
        if valor < 0 or valor > 100:
            raise ValidationError({"completado": "El valor de completado debe estar entre 0 y 100."})

    @staticmethod
    def validar_eliminacion(punto_control):
        if not punto_control.estado:
            raise ValidationError("Este punto de control ya se encuentra desactivado.")

    @staticmethod
    def _validar_control(control):
        if not control or not control.strip():
            raise ValidationError({"control": "La descripción del punto de control es obligatoria."})
        if len(control) > 255:
            raise ValidationError({"control": "El punto de control supera el máximo de 255 caracteres."})

    @staticmethod
    def _validar_peso(peso):
        if peso is None:
            raise ValidationError({"peso": "El peso del punto de control es obligatorio."})
        try:
            valor = float(peso)
        except (TypeError, ValueError):
            raise ValidationError({"peso": "El peso debe ser numérico."})
        if valor < 0:
            raise ValidationError({"peso": "El peso no puede ser negativo."})

    @staticmethod
    def _validar_unicidad(control, excluir_id=None):
        if PuntoControlSelector.existe_control(control, excluir_id=excluir_id):
            raise ValidationError(
                {"control": f"Ya existe un punto de control con el texto '{control}'."}
            )