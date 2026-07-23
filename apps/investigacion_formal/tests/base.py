from django.utils import timezone

from apps.usuarios.models import Usuario
from apps.institucional.models import (
    GradoEstudios, Persona, PersonaXGrupo, RolGrupo,
    GrupoInvestigacion, FacultadEscuela, FacultadXGrupo, Gerente,
)
from apps.investigacion_formal.models import (
    Proyecto, Convocatoria, TipoCalificacion, TipoRubro,
    RolInvestigador, Monto, ProyectoXConvocatoria,
)


class InvestigacionFormalFixturesMixin:
    """
    Mixin común para los tests de investigacion_formal. Provee un ejecutor
    (Usuario) y helpers para construir la cadena de dependencias institucionales
    (Persona, Gerente, PersonaXGrupo) y del propio módulo (Proyecto, Convocatoria,
    TipoCalificacion, Monto, etc.) que varias entidades necesitan vía FK.
    """

    def setUp(self):
        self.ejecutor = Usuario.objects.create_user(
            username='cinterno@esmic.edu.co',
            email='cinterno@esmic.edu.co',
            password='cinterno123',
        )
        self.usuario_proyecto = Usuario.objects.create_user(
            username='investigador@esmic.edu.co',
            email='investigador@esmic.edu.co',
            password='investigador123',
        )

        self.grado = GradoEstudios.objects.create(sigla_grado='CIV', descripcion='Civil')
        self.persona = Persona.objects.create(
            grado=self.grado, nombre='Juan', apellido='Pérez',
            documento='123456789', celular='3001234567', correo='juan@esmic.edu.co',
        )

        self.facultad = FacultadEscuela.objects.create(
            nombre_facultad='Facultad de Ingeniería', abreviatura='ING'
        )
        self.grupo = GrupoInvestigacion.objects.create(
            nombre_grupo='Grupo de Pruebas', sigla_grupo='GP'
        )
        FacultadXGrupo.objects.create(grupo=self.grupo, facultad=self.facultad)
        self.rol_grupo = RolGrupo.objects.create(cargo='Investigador')
        self.persona_x_grupo = PersonaXGrupo.objects.create(
            persona=self.persona, rol_grupo=self.rol_grupo, grupo=self.grupo,
            vinculacion='2024-01-01', estado=True,
        )

        self.gerente = Gerente.objects.create(persona=self.persona, estado=True)

        super().setUp()

    def _crear_proyecto(self, titulo='Proyecto de prueba', interno=True, usuario=None, gerente=None):
        return Proyecto.objects.create(
            usuario=usuario or self.usuario_proyecto,
            gerente=gerente or self.gerente,
            titulo=titulo,
            interno=interno,
            registro_acta_cierre=False,
            alianza=False,
            estado=True,
            estado_aprobado='SIN_CALIFICAR',
            financiado=False,
            unidad_ejecutora='ING',
            linea_investigacion='Tecnología',
            codigo='',
            gruplac=False,
        )

    def _crear_convocatoria(self, nombre='Convocatoria 2024', interno=True,
                             inicio='2024-01-01', cierre='2024-12-31'):
        return Convocatoria.objects.create(
            nombre_convocatoria=nombre,
            anio_convocatoria=2024,
            inicio=inicio,
            cierre=cierre,
            estado=True,
            interno=interno,
        )

    def _crear_tipo_calificacion(self, nombre='Fase 1', orden=1, evaluacion=False):
        return TipoCalificacion.objects.create(
            tipo_calificacion=nombre,
            descripcion=f'Descripción {nombre}',
            evaluacion=evaluacion,
            orden_fase=orden,
        )

    def _crear_proyecto_x_convocatoria(self, proyecto=None, convocatoria=None):
        proyecto = proyecto or self._crear_proyecto()
        convocatoria = convocatoria or self._crear_convocatoria()
        return ProyectoXConvocatoria.objects.create(
            proyecto=proyecto,
            convocatoria=convocatoria,
            estado=True,
            fecha_crea=timezone.now().date(),
        )

    def _crear_tipo_rubro(self, nombre='Personal'):
        return TipoRubro.objects.create(nombre_rubro=nombre)

    def _crear_monto(self, proyecto=None, solicitado=1000000):
        proyecto = proyecto or self._crear_proyecto()
        return Monto.objects.create(
            proyecto=proyecto, solicitado=solicitado, aprobado=0,
            ejecutado=0, contrapartida=0, total=0,
        )

    def _crear_rol_investigador(self, nombre='Investigador Principal'):
        return RolInvestigador.objects.create(
            nombre_rol_investigador=nombre, descripcion='Rol de prueba'
        )