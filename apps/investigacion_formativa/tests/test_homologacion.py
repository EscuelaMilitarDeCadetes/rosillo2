from django.test import TestCase
from rest_framework.exceptions import ValidationError

from .base import InvestigacionFormativaFixturesMixin
from apps.investigacion_formativa.services.homologacion_service import HomologacionService


class HomologacionServiceTests(InvestigacionFormativaFixturesMixin, TestCase):

    def _crear_homologacion(self):
        return HomologacionService.crear(
            proceso_id=self.proceso.pk,
            ejecutor=self.ejecutor,
            observaciones='Solicitud de homologación de certificado externo.',
        )

    def test_crear_homologacion_exitosa(self):
        homologacion = self._crear_homologacion()
        self.assertEqual(homologacion.estado, 'PENDIENTE')

    def test_crear_homologacion_duplicada_para_proceso_falla(self):
        self._crear_homologacion()
        with self.assertRaises(ValidationError):
            self._crear_homologacion()

    def test_aprobar_homologacion_exitoso(self):
        homologacion = self._crear_homologacion()
        aprobada = HomologacionService.aprobar(
            homologacion_id=homologacion.pk,
            aprobado_por_id=self.ejecutor.pk,
            creditos_reconocidos=6,
            ejecutor=self.ejecutor,
        )
        self.assertEqual(aprobada.estado, 'APROBADA')
        self.assertEqual(aprobada.creditos_reconocidos, 6)
        self.assertIsNotNone(aprobada.fecha_homologacion)

    def test_aprobar_homologacion_dos_veces_falla(self):
        homologacion = self._crear_homologacion()
        HomologacionService.aprobar(
            homologacion_id=homologacion.pk, aprobado_por_id=self.ejecutor.pk,
            creditos_reconocidos=6, ejecutor=self.ejecutor,
        )
        with self.assertRaises(ValidationError):
            HomologacionService.aprobar(
                homologacion_id=homologacion.pk, aprobado_por_id=self.ejecutor.pk,
                creditos_reconocidos=6, ejecutor=self.ejecutor,
            )

    def test_rechazar_homologacion_exitoso(self):
        homologacion = self._crear_homologacion()
        rechazada = HomologacionService.rechazar(
            homologacion_id=homologacion.pk,
            observaciones='El certificado no corresponde a la línea de investigación.',
            ejecutor=self.ejecutor,
        )
        self.assertEqual(rechazada.estado, 'RECHAZADA')

    def test_rechazar_homologacion_sin_observaciones_falla(self):
        homologacion = self._crear_homologacion()
        with self.assertRaises(ValidationError):
            HomologacionService.rechazar(
                homologacion_id=homologacion.pk, observaciones='', ejecutor=self.ejecutor,
            )

    def test_obtener_por_proceso(self):
        homologacion = self._crear_homologacion()
        encontrada = HomologacionService.obtener_por_proceso(self.proceso.pk)
        self.assertEqual(encontrada.pk, homologacion.pk)