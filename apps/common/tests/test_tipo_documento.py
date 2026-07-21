from django.test import TestCase
from rest_framework.exceptions import ValidationError
from .base import CommonFixturesMixin
from apps.common.services.tipo_documento_service import TipoDocumentoService


class TipoDocumentoServiceTests(CommonFixturesMixin, TestCase):

    def test_crear_tipo_documento_exitoso(self):
        tipo = TipoDocumentoService.crear('Carta de Aval', 'convocatoria')
        self.assertEqual(tipo.nombre_documento, 'Carta de Aval')
        self.assertEqual(tipo.grupo, 'convocatoria')

    def test_crear_tipo_documento_nombre_duplicado_falla(self):
        with self.assertRaises(ValidationError):
            TipoDocumentoService.crear('acta de cierre', 'presupuesto')  # ya existe en setUp

    def test_crear_tipo_documento_nombre_vacio_falla(self):
        with self.assertRaises(ValidationError):
            TipoDocumentoService.crear('   ', 'proyecto')

    def test_crear_tipo_documento_grupo_vacio_falla(self):
        with self.assertRaises(ValidationError):
            TipoDocumentoService.crear('Documento X', '')

    def test_actualizar_tipo_documento_exitoso(self):
        actualizado = TipoDocumentoService.actualizar(
            self.tipo_documento.pk, 'Acta de Cierre Final', 'proyecto'
        )
        self.assertEqual(actualizado.nombre_documento, 'Acta de Cierre Final')

    def test_actualizar_tipo_documento_nombre_duplicado_con_otro_falla(self):
        TipoDocumentoService.crear('Carta de Aval', 'convocatoria')
        with self.assertRaises(ValidationError):
            TipoDocumentoService.actualizar(self.tipo_documento.pk, 'Carta de Aval', 'proyecto')

    def test_listar_por_grupo(self):
        TipoDocumentoService.crear('Carta de Aval', 'convocatoria')
        resultados = TipoDocumentoService.listar_por_grupo('proyecto')
        self.assertEqual(resultados.count(), 1)
        self.assertEqual(resultados.first().nombre_documento, 'Acta de Cierre')