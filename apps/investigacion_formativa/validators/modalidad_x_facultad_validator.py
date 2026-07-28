# apps/investigacion_formativa/validators/modalidad_x_facultad_validator.py

from rest_framework.exceptions import ValidationError

from apps.investigacion_formativa.selectors.modalidad_x_facultad_selector import ModalidadXFacultadSelector


class ModalidadXFacultadValidator:

    @staticmethod
    def validar_creacion(facultad_id, modalidad_id, disponible=True):
        if not isinstance(disponible, bool):
            raise ValidationError({"disponible": "El campo 'disponible' debe ser verdadero o falso."})
        ModalidadXFacultadValidator._validar_unicidad(facultad_id, modalidad_id)

    @staticmethod
    def validar_actualizacion(modalidad_facultad_id, facultad_id, modalidad_id):
        ModalidadXFacultadValidator._validar_unicidad(facultad_id, modalidad_id, excluir_id=modalidad_facultad_id)

    @staticmethod
    def validar_habilitacion(modalidad_facultad):
        if modalidad_facultad.disponible:
            raise ValidationError("Esta modalidad ya se encuentra habilitada para esta facultad.")

    @staticmethod
    def validar_deshabilitacion(modalidad_facultad):
        if not modalidad_facultad.disponible:
            raise ValidationError("Esta modalidad ya se encuentra deshabilitada para esta facultad.")

    @staticmethod
    def validar_eliminacion(modalidad_facultad):
        # eliminar() del service es equivalente semánticamente a deshabilitar (soft-delete
        # sobre el mismo campo 'disponible'), así que reusa la misma regla.
        ModalidadXFacultadValidator.validar_deshabilitacion(modalidad_facultad)

    @staticmethod
    def _validar_unicidad(facultad_id, modalidad_id, excluir_id=None):
        if ModalidadXFacultadSelector.existe_facultad_modalidad(facultad_id, modalidad_id, excluir_id=excluir_id):
            raise ValidationError(
                "Ya existe un registro de esta modalidad para esta facultad."
            )