from apps.investigacion_formativa.models import Estudiante


class EstudianteSelector:

    @staticmethod
    def listar():
        return (
            Estudiante.objects
            .select_related('persona', 'modalidad_facultad__facultad', 'modalidad_facultad__modalidad')
            .order_by('persona__apellido', 'persona__nombre')
        )

    @staticmethod
    def obtener(estudiante_id):
        return Estudiante.objects.get(pk=estudiante_id)

    @staticmethod
    def buscar(estudiante_id):
        return Estudiante.objects.filter(pk=estudiante_id).first()

    @staticmethod
    def existe(estudiante_id):
        return Estudiante.objects.filter(pk=estudiante_id).exists()

    @staticmethod
    def obtener_por_persona(persona_id):
        return Estudiante.objects.filter(persona_id=persona_id).first()
    
    @staticmethod
    def existe_persona(persona_id, excluir_id=None):
        """Valida el OneToOneField Estudiante.persona antes de crear/actualizar:
        una Persona no puede tener más de un registro Estudiante, sin importar
        la modalidad (unique_together retirado; ver hallazgo de esquema resuelto)."""
        qs = Estudiante.objects.filter(persona_id=persona_id)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def listar_por_modalidad_facultad(modalidad_facultad_id, estado=None):
        qs = Estudiante.objects.filter(modalidad_facultad_id=modalidad_facultad_id)
        if estado is not None:
            qs = qs.filter(estado=estado)
        return qs.select_related('persona').order_by('persona__apellido')

    @staticmethod
    def listar_por_facultad(facultad_id, estado=None):
        qs = Estudiante.objects.filter(modalidad_facultad__facultad_id=facultad_id)
        if estado is not None:
            qs = qs.filter(estado=estado)
        return qs.select_related('persona', 'modalidad_facultad__modalidad').order_by('persona__apellido')

    @staticmethod
    def listar_por_modalidad(modalidad_id, estado=None):
        qs = Estudiante.objects.filter(modalidad_facultad__modalidad_id=modalidad_id)
        if estado is not None:
            qs = qs.filter(estado=estado)
        return qs.select_related('persona', 'modalidad_facultad__facultad').order_by('persona__apellido')

    @staticmethod
    def listar_activos():
        return Estudiante.objects.filter(estado=True).select_related('persona')

    @staticmethod
    def listar_inactivos():
        return Estudiante.objects.filter(estado=False).select_related('persona')

    @staticmethod
    def buscar_por_correo_personal(correo_personal):
        return Estudiante.objects.filter(correo_personal__iexact=correo_personal).first()

    @staticmethod
    def listar_por_nivel(nivel):
        return Estudiante.objects.filter(nivel__iexact=nivel).select_related('persona')