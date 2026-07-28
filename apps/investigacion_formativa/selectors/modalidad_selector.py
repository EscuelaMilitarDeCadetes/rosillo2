# apps/investigacion_formativa/selectors/modalidad_selector.py

from apps.investigacion_formativa.models import Modalidad


class ModalidadSelector:

    @staticmethod
    def listar():
        return Modalidad.objects.all().order_by('nombre')

    @staticmethod
    def obtener(modalidad_id):
        return Modalidad.objects.get(pk=modalidad_id)

    @staticmethod
    def buscar(modalidad_id):
        return Modalidad.objects.filter(pk=modalidad_id).first()

    @staticmethod
    def existe(modalidad_id):
        return Modalidad.objects.filter(pk=modalidad_id).exists()

    @staticmethod
    def existe_nombre(nombre, excluir_id=None):
        """Valida el unique=True de 'nombre' antes de crear/actualizar."""
        qs = Modalidad.objects.filter(nombre__iexact=nombre)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def buscar_por_codigo(codigo):
        return Modalidad.objects.filter(codigo__iexact=codigo).first()

    @staticmethod
    def listar_activas():
        return Modalidad.objects.filter(activo=True).order_by('nombre')

    @staticmethod
    def listar_inactivas():
        return Modalidad.objects.filter(activo=False).order_by('nombre')

    @staticmethod
    def listar_que_requieren_tutor():
        return Modalidad.objects.filter(activo=True, requiere_tutor=True)

    @staticmethod
    def listar_que_requieren_evaluadores():
        return Modalidad.objects.filter(activo=True, requiere_evaluadores=True)

    @staticmethod
    def listar_que_requieren_sustentacion():
        return Modalidad.objects.filter(activo=True, requiere_sustentacion=True)

    @staticmethod
    def listar_que_requieren_antiplagio():
        return Modalidad.objects.filter(activo=True, requiere_antiplagio=True)

    @staticmethod
    def listar_que_permiten_homologacion():
        return Modalidad.objects.filter(activo=True, permite_homologacion=True)

    @staticmethod
    def listar_que_requieren_producto_final():
        return Modalidad.objects.filter(activo=True, requiere_producto_final=True)