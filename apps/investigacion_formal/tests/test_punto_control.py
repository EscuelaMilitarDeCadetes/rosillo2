from django.test import TestCase
from rest_framework.exceptions import ValidationError

from .base import InvestigacionFormalFixturesMixin
from apps.investigacion_formal.services.punto_control_service import PuntoControlService


class PuntoControlServiceTests(InvestigacionFormalFixturesMixin, TestCase):

    def test_crear_punto_control_exitoso(self):
        punto = PuntoControlService.crear(
            control='Entrega de avance trimestral', peso=25, ejecutor=self.ejecutor,
        )
        self.assertTrue(punto.estado)
        self.assertEqual(punto.completado, 0)

    def test_crear_punto_control_texto_duplicado_falla(self):
        PuntoControlService.crear(
            control='Punto Único', peso=10, ejecutor=self.ejecutor,
        )
        with self.assertRaises(ValidationError):
            PuntoControlService.crear(
                control='punto único', peso=15, ejecutor=self.ejecutor,
            )

    def test_crear_punto_control_peso_negativo_falla(self):
        with self.assertRaises(ValidationError):
            PuntoControlService.crear(
                control='Punto Inválido', peso=-10, ejecutor=self.ejecutor,
            )

    def test_actualizar_punto_control_exitoso(self):
        punto = PuntoControlService.crear(
            control='Punto Original', peso=10, ejecutor=self.ejecutor,
        )
        actualizado = PuntoControlService.actualizar(
            punto_control_id=punto.pk, control='Punto Corregido', peso=20,
            ejecutor=self.ejecutor,
        )
        self.assertEqual(actualizado.control, 'Punto Corregido')
        self.assertEqual(actualizado.peso, 20)

    def test_eliminar_punto_control_soft_delete(self):
        punto = PuntoControlService.crear(
            control='Punto a Desactivar', peso=10, ejecutor=self.ejecutor,
        )
        PuntoControlService.eliminar(punto.pk, ejecutor=self.ejecutor)
        punto.refresh_from_db()
        self.assertFalse(punto.estado)

    def test_eliminar_punto_control_ya_desactivado_falla(self):
        punto = PuntoControlService.crear(
            control='Punto Doble Baja', peso=10, ejecutor=self.ejecutor,
        )
        PuntoControlService.eliminar(punto.pk, ejecutor=self.ejecutor)
        with self.assertRaises(ValidationError):
            PuntoControlService.eliminar(punto.pk, ejecutor=self.ejecutor)

    def test_listar_puntos_control(self):
        PuntoControlService.crear(control='Punto 1', peso=10, ejecutor=self.ejecutor)
        PuntoControlService.crear(control='Punto 2', peso=20, ejecutor=self.ejecutor)
        self.assertEqual(PuntoControlService.listar().count(), 2)