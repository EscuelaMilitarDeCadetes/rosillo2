from django.test import TestCase
from rest_framework.exceptions import ValidationError

from .base import InvestigacionFormalFixturesMixin
from apps.investigacion_formal.models import TipoProducto
from apps.common.models import TipoDocumento
from apps.investigacion_formal.services.producto_minciencias_service import (
    ProductoMincienciasService,
)
from apps.investigacion_formal.services.grupo_minciencias_service import GrupoMincienciasService
from apps.investigacion_formal.services.producto_x_grupo_service import ProductoXGrupoService
from apps.investigacion_formal.services.producto_x_proyecto_service import (
    ProductoXProyectoService,
)


class ProductoXProyectoServiceTests(InvestigacionFormalFixturesMixin, TestCase):

    def setUp(self):
        super().setUp()
        self.proyecto = self._crear_proyecto()

        producto_minciencias = ProductoMincienciasService.crear(
            nombre_producto='Producto Base', nomenclatura='PB-2',
            peso=10, vigencia=4, ejecutor=self.ejecutor,
        )
        grupo_minciencias = GrupoMincienciasService.crear(
            nombre_grupo_minciencias='Grupo Producción', ejecutor=self.ejecutor,
        )
        tipo_producto = TipoProducto.objects.create(tipo_producto='Software', aplica=True)
        self.producto_x_grupo = ProductoXGrupoService.crear(
            producto_minciencias_id=producto_minciencias.pk,
            grupo_minciencias_id=grupo_minciencias.pk,
            tipo_producto_id=tipo_producto.pk,
            ejecutor=self.ejecutor,
        )
        self.tipo_documento = TipoDocumento.objects.create(
            nombre_documento='Certificado de Producto', grupo='proyecto',
        )

    def test_crear_producto_x_proyecto_exitoso(self):
        producto = ProductoXProyectoService.crear(
            producto_x_grupo_id=self.producto_x_grupo.pk,
            proyecto_id=self.proyecto.pk,
            categoria='Reconocido',
            puntaje=10,
            ejecutor=self.ejecutor,
        )
        self.assertTrue(producto.activo)
        self.assertFalse(producto.entregado)

    def test_crear_producto_x_proyecto_puntaje_negativo_falla(self):
        with self.assertRaises(ValidationError):
            ProductoXProyectoService.crear(
                producto_x_grupo_id=self.producto_x_grupo.pk,
                proyecto_id=self.proyecto.pk,
                categoria='Reconocido',
                puntaje=-5,
                ejecutor=self.ejecutor,
            )

    def test_registrar_entrega_exitoso(self):
        producto = ProductoXProyectoService.crear(
            producto_x_grupo_id=self.producto_x_grupo.pk,
            proyecto_id=self.proyecto.pk,
            categoria='Reconocido',
            puntaje=10,
            ejecutor=self.ejecutor,
        )
        entregado = ProductoXProyectoService.registrar_entrega(
            producto_x_proyecto_id=producto.pk,
            documento='certificado_producto.pdf',
            tipo_documento_id=self.tipo_documento.pk,
            ejecutor=self.ejecutor,
        )
        self.assertTrue(entregado.entregado)
        self.assertEqual(entregado.documento, 'certificado_producto.pdf')

    def test_registrar_entrega_sin_documento_falla(self):
        producto = ProductoXProyectoService.crear(
            producto_x_grupo_id=self.producto_x_grupo.pk,
            proyecto_id=self.proyecto.pk,
            categoria='Reconocido',
            puntaje=10,
            ejecutor=self.ejecutor,
        )
        with self.assertRaises(ValidationError):
            ProductoXProyectoService.registrar_entrega(
                producto_x_proyecto_id=producto.pk,
                documento='',
                tipo_documento_id=self.tipo_documento.pk,
                ejecutor=self.ejecutor,
            )

    def test_subir_a_gruplac(self):
        producto = ProductoXProyectoService.crear(
            producto_x_grupo_id=self.producto_x_grupo.pk,
            proyecto_id=self.proyecto.pk,
            categoria='Reconocido',
            puntaje=10,
            ejecutor=self.ejecutor,
        )
        actualizado = ProductoXProyectoService.subir_a_gruplac(producto.pk, ejecutor=self.ejecutor)
        self.assertTrue(actualizado.gruplac)

    def test_eliminar_producto_x_proyecto_soft_delete(self):
        producto = ProductoXProyectoService.crear(
            producto_x_grupo_id=self.producto_x_grupo.pk,
            proyecto_id=self.proyecto.pk,
            categoria='Reconocido',
            puntaje=10,
            ejecutor=self.ejecutor,
        )
        ProductoXProyectoService.eliminar(producto.pk, ejecutor=self.ejecutor)
        producto.refresh_from_db()
        self.assertFalse(producto.activo)

    def test_eliminar_producto_x_proyecto_ya_desactivado_falla(self):
        producto = ProductoXProyectoService.crear(
            producto_x_grupo_id=self.producto_x_grupo.pk,
            proyecto_id=self.proyecto.pk,
            categoria='Reconocido',
            puntaje=10,
            ejecutor=self.ejecutor,
        )
        ProductoXProyectoService.eliminar(producto.pk, ejecutor=self.ejecutor)
        with self.assertRaises(ValidationError):
            ProductoXProyectoService.eliminar(producto.pk, ejecutor=self.ejecutor)

    def test_listar_pendientes_por_proyecto(self):
        ProductoXProyectoService.crear(
            producto_x_grupo_id=self.producto_x_grupo.pk,
            proyecto_id=self.proyecto.pk,
            categoria='Pendiente',
            puntaje=5,
            ejecutor=self.ejecutor,
        )
        resultado = ProductoXProyectoService.listar_pendientes_por_proyecto(self.proyecto.pk)
        self.assertEqual(resultado.count(), 1)

    def test_listar_entregados_por_proyecto(self):
        producto = ProductoXProyectoService.crear(
            producto_x_grupo_id=self.producto_x_grupo.pk,
            proyecto_id=self.proyecto.pk,
            categoria='Entregado',
            puntaje=5,
            ejecutor=self.ejecutor,
        )
        ProductoXProyectoService.registrar_entrega(
            producto_x_proyecto_id=producto.pk,
            documento='doc.pdf',
            tipo_documento_id=self.tipo_documento.pk,
            ejecutor=self.ejecutor,
        )
        resultado = ProductoXProyectoService.listar_entregados_por_proyecto(self.proyecto.pk)
        self.assertEqual(resultado.count(), 1)