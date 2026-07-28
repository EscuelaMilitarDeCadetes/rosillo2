# apps/investigacion_formativa/tests/base.py

from datetime import date
from apps.usuarios.models import RolPlataforma, RolXUsuario
from apps.usuarios.models import Usuario
from apps.institucional.models import GradoEstudios, Persona, FacultadEscuela
from apps.common.models import TipoDocumento, DocumentoFirma
from apps.investigacion_formativa.models import (
    Modalidad, FlujoProceso, EtapaFlujo, BancoIdeas, ProcesoFormativo, InstanciaEtapa,
)


class InvestigacionFormativaFixturesMixin:

    def setUp(self):
        self.ejecutor = Usuario.objects.create_user(
            username='cinterno@esmic.edu.co',
            email='cinterno@esmic.edu.co',
            password='cinterno123',
        )
        
        rol_soporte, _ = RolPlataforma.objects.get_or_create(
            nombre_rol='SOPORTE', defaults={'descripcion': 'Soporte'},
        )
        RolXUsuario.objects.create(usuario=self.ejecutor, rol=rol_soporte, estado=True)

        self.grado = GradoEstudios.objects.create(sigla_grado='CIV', descripcion='Civil')

        self.persona = Persona.objects.create(
            grado=self.grado, nombre='Ana', apellido='Gómez',
            documento='100200300', celular='3009876543', correo='ana@esmic.edu.co',
        )

        self.facultad = FacultadEscuela.objects.create(
            nombre_facultad='Facultad de Ingeniería', abreviatura='ING'
        )

        self.modalidad = Modalidad.objects.create(
            nombre='Trabajo de Grado Pregrado',
            codigo='TGP',
            activo=True,
            requiere_evaluadores=True,
            requiere_tutor=True,
            requiere_antiplagio=True,
            requiere_sustentacion=True,
            permite_homologacion=False,
            requiere_producto_final=True,
        )

        self.flujo = FlujoProceso.objects.create(
            modalidad=self.modalidad,
            nombre='Flujo Trabajo de Grado Pregrado v1',
            version=1,
            tipo='FORMATIVA',
            activo=True,
            fecha_vigencia_inicio=date(2024, 1, 1),
        )

        self.idea = BancoIdeas.objects.create(
            facultad=self.facultad,
            idea='Idea semilla de prueba',
            descripcion='Descripción de prueba',
            linea_investigacion='Tecnología',
            palabras_clave='pruebas, django',
            estado='DISPONIBLE',
        )

        super().setUp()

    def _crear_proceso_formativo(self, titulo='Proceso de prueba', flujo_version=None, idea=None,
                                  fecha_inicio=None, fecha_fin=None, activo=True):
        return ProcesoFormativo.objects.create(
            idea=idea if idea is not None else self.idea,
            flujo_version=flujo_version or self.flujo,
            titulo=titulo,
            estado_general='EN_PROCESO',
            observacion='Observación de prueba',
            fecha_inicio=fecha_inicio or date(2024, 1, 1),
            fecha_fin=fecha_fin or date(2024, 12, 31),
            activo=activo,
        )

    def _crear_etapa_flujo(self, flujo=None, orden=1, nombre='Etapa 1',
                            rol_responsable='ESTUDIANTE', es_final=False):
        return EtapaFlujo.objects.create(
            flujo=flujo or self.flujo,
            nombre=nombre,
            orden=orden,
            codigo=f'ETP-{orden}',
            rol_responsable=rol_responsable,
            es_final=es_final,
        )

    def _crear_instancia_etapa(self, proceso, etapa, estado='PENDIENTE'):
        return InstanciaEtapa.objects.create(proceso=proceso, etapa=etapa, estado=estado)

    def _crear_banco_idea(self, facultad=None, idea='Otra idea', estado='DISPONIBLE'):
        return BancoIdeas.objects.create(
            facultad=facultad or self.facultad,
            idea=idea,
            descripcion='Descripción',
            linea_investigacion='Línea',
            palabras_clave='clave',
            estado=estado,
        )

    def _crear_documento_firma(self, nombre_documento):
        tipo_documento = TipoDocumento.objects.create(
            nombre_documento=nombre_documento, grupo='INVESTIGACION_FORMATIVA'
        )
        return DocumentoFirma.objects.create(
            tipo_documento=tipo_documento,
            version=1,
            ruta_documento='/documentos/prueba.pdf',
            hash_documento='0' * 64,
            ip_creacion='127.0.0.1',
        )