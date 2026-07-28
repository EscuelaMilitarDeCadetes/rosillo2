# apps/investigacion_formativa/selectors/modalidad_x_facultad_selector.py

from apps.investigacion_formativa.models import ModalidadXFacultad


class ModalidadXFacultadSelector:

    @staticmethod
    def listar():
        return (
            ModalidadXFacultad.objects
            .select_related('facultad', 'modalidad')
            .order_by('facultad', 'modalidad')
        )

    @staticmethod
    def obtener(modalidad_facultad_id):
        return ModalidadXFacultad.objects.get(pk=modalidad_facultad_id)

    @staticmethod
    def buscar(modalidad_facultad_id):
        return ModalidadXFacultad.objects.filter(pk=modalidad_facultad_id).first()

    @staticmethod
    def existe(modalidad_facultad_id):
        return ModalidadXFacultad.objects.filter(pk=modalidad_facultad_id).exists()

    @staticmethod
    def existe_facultad_modalidad(facultad_id, modalidad_id, excluir_id=None):
        """Valida unique_together ('facultad', 'modalidad') antes de crear/actualizar."""
        qs = ModalidadXFacultad.objects.filter(facultad_id=facultad_id, modalidad_id=modalidad_id)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def obtener_por_facultad_y_modalidad(facultad_id, modalidad_id):
        return ModalidadXFacultad.objects.filter(
            facultad_id=facultad_id, modalidad_id=modalidad_id
        ).first()

    @staticmethod
    def listar_por_facultad(facultad_id, disponible=None):
        qs = ModalidadXFacultad.objects.select_related('modalidad').filter(facultad_id=facultad_id)
        if disponible is not None:
            qs = qs.filter(disponible=disponible)
        return qs.order_by('modalidad__nombre')

    @staticmethod
    def listar_por_modalidad(modalidad_id, disponible=None):
        qs = ModalidadXFacultad.objects.select_related('facultad').filter(modalidad_id=modalidad_id)
        if disponible is not None:
            qs = qs.filter(disponible=disponible)
        return qs.order_by('facultad__nombre_facultad')

    @staticmethod
    def listar_disponibles(facultad_id=None):
        qs = ModalidadXFacultad.objects.filter(disponible=True)
        if facultad_id is not None:
            qs = qs.filter(facultad_id=facultad_id)
        return qs.select_related('facultad', 'modalidad')

    @staticmethod
    def listar_no_disponibles(facultad_id=None):
        qs = ModalidadXFacultad.objects.filter(disponible=False)
        if facultad_id is not None:
            qs = qs.filter(facultad_id=facultad_id)
        return qs.select_related('facultad', 'modalidad')