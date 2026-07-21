from apps.usuarios.models import Usuario
from apps.institucional.models import FacultadEscuela
from apps.common.services.tipo_documento_service import TipoDocumentoService


class CommonFixturesMixin:
    """
    Mixin común para los tests de common. Provee un ejecutor (Usuario), un
    TipoDocumento base y un objeto "genérico" liviano (FacultadEscuela) para
    probar las relaciones GenericForeignKey de Tarea, DocumentoFirma e
    Historial sin depender de módulos con fixtures más pesadas
    (investigacion_formal.Proyecto, por ejemplo).
    """

    def setUp(self):
        self.ejecutor = Usuario.objects.create_user(
            username='admin@esmic.edu.co',
            email='admin@esmic.edu.co',
            password='admin123',
        )
        self.otro_usuario = Usuario.objects.create_user(
            username='revisor@esmic.edu.co',
            email='revisor@esmic.edu.co',
            password='revisor123',
        )
        self.tipo_documento = TipoDocumentoService.crear(
            nombre_documento='Acta de Cierre', grupo='proyecto'
        )
        self.objeto_generico = FacultadEscuela.objects.create(
            nombre_facultad='Facultad de Pruebas', abreviatura='FPRB'
        )
        super().setUp()

    def _crear_objeto_generico(self, nombre='Facultad Adicional', abreviatura='FADI'):
        return FacultadEscuela.objects.create(
            nombre_facultad=nombre, abreviatura=abreviatura
        )