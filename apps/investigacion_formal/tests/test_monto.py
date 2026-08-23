from django.test import TestCase
from rest_framework.exceptions import ValidationError

from .base import InvestigacionFormalFixturesMixin
from apps.investigacion_formal.services.monto_service import MontoService


class MontoServiceTests(InvestigacionFormalFixturesMixin, TestCase):

    def setUp(self):
        super().setUp()
        self.proyecto = self._crear_proyecto()

    def test_crear_monto_exitoso(self):
        monto = MontoService.crear(
            proyecto_id=self.proyecto.pk,
            solicitado=1000000,
            ejecutor=self.ejecutor,
        )
        self.assertEqual(monto.solicitado, 1000000)
        self.assertEqual(monto.aprobado, 0)

    def test_crear_monto_duplicado_para_mismo_proyecto_falla(self):
        MontoService.crear(
            proyecto_id=self.proyecto.pk, solicitado=1000000, ejecutor=self.ejecutor,
        )
        with self.assertRaises(ValidationError):
            MontoService.crear(
                proyecto_id=self.proyecto.pk, solicitado=500000, ejecutor=self.ejecutor,
            )

    def test_crear_monto_solicitado_negativo_falla(self):
        with self.assertRaises(ValidationError):
            MontoService.crear(
                proyecto_id=self.proyecto.pk, solicitado=-100, ejecutor=self.ejecutor,
            )

    def test_asignar_aprobado_exitoso_calcula_total(self):
        monto = MontoService.crear(
            proyecto_id=self.proyecto.pk, solicitado=1000000, ejecutor=self.ejecutor,
        )
        actualizado = MontoService.asignar_aprobado(
            monto_id=monto.pk, aprobado=800000, contrapartida=200000, ejecutor=self.ejecutor,
        )
        self.assertEqual(actualizado.aprobado, 800000)
        self.assertEqual(actualizado.contrapartida, 200000)
        self.assertEqual(actualizado.total, 1000000)
        self.assertIsNotNone(actualizado.asignado)

    def test_asignar_aprobado_negativo_falla(self):
        monto = MontoService.crear(
            proyecto_id=self.proyecto.pk, solicitado=1000000, ejecutor=self.ejecutor,
        )
        with self.assertRaises(ValidationError):
            MontoService.asignar_aprobado(
                monto_id=monto.pk, aprobado=-500, contrapartida=0, ejecutor=self.ejecutor,
            )

    def test_editar_valor_aprobado_exitoso(self):
        monto = MontoService.crear(
            proyecto_id=self.proyecto.pk, solicitado=1000000, ejecutor=self.ejecutor,
        )
        MontoService.asignar_aprobado(
            monto_id=monto.pk, aprobado=800000, contrapartida=100000, ejecutor=self.ejecutor,
        )
        actualizado = MontoService.editar_valor_aprobado(
            monto_id=monto.pk, nuevo_aprobado=900000, ejecutor=self.ejecutor,
        )
        self.assertEqual(actualizado.aprobado, 900000)
        # NUEVO: total debe reflejar el nuevo aprobado + la contrapartida ya asignada.
        self.assertEqual(actualizado.total, 1000000)  # 900000 + 100000
        
    def test_editar_valor_aprobado_recalcula_total_sin_contrapartida(self):
        """NUEVO: si nunca se asignó contrapartida (monto.contrapartida es None),
        el cálculo no debe romperse (None + numero -> TypeError sin el 'or 0')."""
        monto = MontoService.crear(
            proyecto_id=self.proyecto.pk, solicitado=1000000, ejecutor=self.ejecutor,
        )
        MontoService.asignar_aprobado(
            monto_id=monto.pk, aprobado=800000, contrapartida=0, ejecutor=self.ejecutor,
        )
        actualizado = MontoService.editar_valor_aprobado(
            monto_id=monto.pk, nuevo_aprobado=850000, ejecutor=self.ejecutor,
        )
        self.assertEqual(actualizado.total, 850000)

    def test_editar_valor_aprobado_menor_a_ejecutado_falla(self):
        monto = MontoService.crear(
            proyecto_id=self.proyecto.pk, solicitado=1000000, ejecutor=self.ejecutor,
        )
        MontoService.asignar_aprobado(
            monto_id=monto.pk, aprobado=800000, contrapartida=0, ejecutor=self.ejecutor,
        )
        monto.ejecutado = 500000
        monto.save(update_fields=['ejecutado'])

        with self.assertRaises(ValidationError):
            MontoService.editar_valor_aprobado(
                monto_id=monto.pk, nuevo_aprobado=400000, ejecutor=self.ejecutor,
            )

    def test_obtener_por_proyecto(self):
        MontoService.crear(
            proyecto_id=self.proyecto.pk, solicitado=1000000, ejecutor=self.ejecutor,
        )
        encontrado = MontoService.obtener_por_proyecto(self.proyecto.pk)
        self.assertIsNotNone(encontrado)
        self.assertEqual(encontrado.proyecto_id, self.proyecto.pk)