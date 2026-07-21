from django.test import TestCase
from rest_framework.exceptions import ValidationError

from .base import InvestigacionFormalFixturesMixin
from apps.investigacion_formal.services.convocatoria_service import ConvocatoriaService


class ConvocatoriaServiceTests(InvestigacionFormalFixturesMixin, TestCase):

    def test_crear_convocatoria_exitoso(self):
        convocatoria = ConvocatoriaService.crear(
            nombre_convocatoria='Convocatoria Interna 2024',
            anio_convocatoria=2024,
            inicio='2024-01-01',
            cierre='2024-06-30',
            interno=True,
            ejecutor=self.ejecutor,
        )
        self.assertTrue(convocatoria.estado)
        self.assertTrue(convocatoria.interno)

    def test_crear_convocatoria_nombre_duplicado_falla(self):
        ConvocatoriaService.crear(
            nombre_convocatoria='Convocatoria Única',
            anio_convocatoria=2024,
            inicio='2024-01-01',
            cierre='2024-06-30',
            interno=True,
            ejecutor=self.ejecutor,
        )
        with self.assertRaises(ValidationError):
            ConvocatoriaService.crear(
                nombre_convocatoria='convocatoria única',
                anio_convocatoria=2024,
                inicio='2024-07-01',
                cierre='2024-12-31',
                interno=False,
                ejecutor=self.ejecutor,
            )

    def test_crear_convocatoria_cierre_anterior_a_inicio_falla(self):
        with self.assertRaises(ValidationError):
            ConvocatoriaService.crear(
                nombre_convocatoria='Convocatoria Inválida',
                anio_convocatoria=2024,
                inicio='2024-06-30',
                cierre='2024-01-01',
                interno=True,
                ejecutor=self.ejecutor,
            )

    def test_cambiar_estado_exitoso(self):
        convocatoria = ConvocatoriaService.crear(
            nombre_convocatoria='Convocatoria a Cerrar',
            anio_convocatoria=2024,
            inicio='2024-01-01',
            cierre='2024-06-30',
            interno=True,
            ejecutor=self.ejecutor,
        )
        actualizada = ConvocatoriaService.cambiar_estado(
            convocatoria_id=convocatoria.pk,
            nuevo_estado=False,
            ejecutor=self.ejecutor,
        )
        self.assertFalse(actualizada.estado)

    def test_cambiar_estado_al_mismo_valor_falla(self):
        convocatoria = ConvocatoriaService.crear(
            nombre_convocatoria='Convocatoria Repetida',
            anio_convocatoria=2024,
            inicio='2024-01-01',
            cierre='2024-06-30',
            interno=True,
            ejecutor=self.ejecutor,
        )
        with self.assertRaises(ValidationError):
            ConvocatoriaService.cambiar_estado(
                convocatoria_id=convocatoria.pk,
                nuevo_estado=True,
                ejecutor=self.ejecutor,
            )

    def test_listar_activas(self):
        ConvocatoriaService.crear(
            nombre_convocatoria='Activa 1', anio_convocatoria=2024,
            inicio='2024-01-01', cierre='2024-06-30', interno=True,
            ejecutor=self.ejecutor,
        )
        inactiva = ConvocatoriaService.crear(
            nombre_convocatoria='Inactiva 1', anio_convocatoria=2024,
            inicio='2024-01-01', cierre='2024-06-30', interno=True,
            ejecutor=self.ejecutor,
        )
        ConvocatoriaService.cambiar_estado(inactiva.pk, False, ejecutor=self.ejecutor)

        activas = ConvocatoriaService.listar_activas()
        self.assertEqual(activas.count(), 1)

    def test_listar_internas_y_externas(self):
        ConvocatoriaService.crear(
            nombre_convocatoria='Interna 1', anio_convocatoria=2024,
            inicio='2024-01-01', cierre='2024-06-30', interno=True,
            ejecutor=self.ejecutor,
        )
        ConvocatoriaService.crear(
            nombre_convocatoria='Externa 1', anio_convocatoria=2024,
            inicio='2024-01-01', cierre='2024-06-30', interno=False,
            ejecutor=self.ejecutor,
        )
        self.assertEqual(ConvocatoriaService.listar_internas().count(), 1)
        self.assertEqual(ConvocatoriaService.listar_externas().count(), 1)