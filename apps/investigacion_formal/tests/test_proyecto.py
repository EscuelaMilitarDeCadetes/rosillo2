from django.test import TestCase
from rest_framework.exceptions import ValidationError

from .base import InvestigacionFormalFixturesMixin
from apps.investigacion_formal.services.proyecto_service import ProyectoService


class ProyectoServiceTests(InvestigacionFormalFixturesMixin, TestCase):

    def test_crear_proyecto_exitoso(self):
        proyecto = ProyectoService.crear(
            usuario_id=self.usuario_proyecto.pk,
            gerente_id=self.gerente.pk,
            titulo='Sistema de Gestión Académica',
            interno=True,
            alianza=False,
            financiado=True,
            unidad_ejecutora='ING',
            linea_investigacion='Tecnología',
            ejecutor=self.ejecutor,
        )
        self.assertEqual(proyecto.estado_aprobado, 'SIN_CALIFICAR')
        self.assertTrue(proyecto.estado)

    def test_crear_proyecto_titulo_duplicado_falla(self):
        ProyectoService.crear(
            usuario_id=self.usuario_proyecto.pk, gerente_id=self.gerente.pk,
            titulo='Proyecto Único', interno=True, alianza=False, financiado=False,
            unidad_ejecutora='ING', linea_investigacion='Tecnología', ejecutor=self.ejecutor,
        )
        with self.assertRaises(ValidationError):
            ProyectoService.crear(
                usuario_id=self.usuario_proyecto.pk, gerente_id=self.gerente.pk,
                titulo='proyecto único', interno=True, alianza=False, financiado=False,
                unidad_ejecutora='ING', linea_investigacion='Tecnología', ejecutor=self.ejecutor,
            )

    def test_crear_proyecto_sin_titulo_falla(self):
        with self.assertRaises(ValidationError):
            ProyectoService.crear(
                usuario_id=self.usuario_proyecto.pk, gerente_id=self.gerente.pk,
                titulo='   ', interno=True, alianza=False, financiado=False,
                unidad_ejecutora='ING', linea_investigacion='Tecnología', ejecutor=self.ejecutor,
            )

    def test_actualizar_proyecto_exitoso(self):
        proyecto = self._crear_proyecto(titulo='Título Original')
        actualizado = ProyectoService.actualizar(
            proyecto_id=proyecto.pk,
            titulo='Título Corregido',
            unidad_ejecutora='ING',
            linea_investigacion='Tecnología',
            ejecutor=self.ejecutor,
        )
        self.assertEqual(actualizado.titulo, 'Título Corregido')

    def test_asignar_timeline_genera_codigo_consecutivo(self):
        proyecto = self._crear_proyecto(titulo='Proyecto con Timeline')
        actualizado = ProyectoService.asignar_timeline(
            proyecto_id=proyecto.pk,
            fecha_inicio='2024-01-01',
            fecha_fin='2024-12-31',
            ejecutor=self.ejecutor,
        )
        self.assertIsNotNone(actualizado.fecha_inicio)
        self.assertTrue(actualizado.codigo)
        self.assertIn('I', actualizado.codigo)

    def test_asignar_timeline_fechas_invertidas_falla(self):
        proyecto = self._crear_proyecto(titulo='Proyecto con Fechas Malas')
        with self.assertRaises(ValidationError):
            ProyectoService.asignar_timeline(
                proyecto_id=proyecto.pk,
                fecha_inicio='2024-12-31',
                fecha_fin='2024-01-01',
                ejecutor=self.ejecutor,
            )

    def test_editar_fecha_cierre_exitoso(self):
        proyecto = self._crear_proyecto(titulo='Proyecto a Cerrar')
        ProyectoService.asignar_time