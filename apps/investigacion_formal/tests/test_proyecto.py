from datetime import date

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
            fecha_inicio=date(2024, 1, 1),
            fecha_fin=date(2024, 12, 31),
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
                fecha_inicio=date(2024, 12, 31),
                fecha_fin=date(2024, 1, 1),
                ejecutor=self.ejecutor,
            )

    def test_editar_fecha_cierre_exitoso(self):
        proyecto = self._crear_proyecto(titulo='Proyecto a Cerrar')
        proyecto = ProyectoService.asignar_timeline(
            proyecto_id=proyecto.pk,
            fecha_inicio='2024-01-01',
            fecha_fin='2024-12-31',
            ejecutor=self.ejecutor,
        )
        actualizado = ProyectoService.editar_fecha_cierre(
            proyecto_id=proyecto.pk,
            nueva_fecha_fin='2025-06-30',
            ejecutor=self.ejecutor,
        )
        self.assertEqual(str(actualizado.fecha_fin), '2025-06-30')
        
    def test_crear_proyecto_historico_con_codigo_existente(self):
        """
        Cubre INV-16: antes de su corrección, cualquier llamada a
        ProyectoService.crear() —con o sin código— fallaba con
        TypeError porque ProyectoValidator.validar_creacion() no
        aceptaba el parámetro `codigo`. Este test falla de inmediato
        si esa regresión vuelve a aparecer.
        """
        proyecto = ProyectoService.crear(
            usuario_id=self.usuario_proyecto.pk,
            gerente_id=self.gerente.pk,
            titulo='Proyecto Histórico Cargado al Repositorio',
            interno=True,
            alianza=False,
            financiado=True,
            unidad_ejecutora='ING',
            linea_investigacion='Tecnología',
            ejecutor=self.ejecutor,
            codigo='ING2019-I03',
            estado_aprobado='APROBADO',
        )
        self.assertEqual(proyecto.codigo, 'ING2019-I03')
        self.assertEqual(proyecto.estado_aprobado, 'APROBADO')

    def test_asignar_timeline_no_sobreescribe_codigo_historico(self):
        """
        Cubre el guardián `if not proyecto.codigo` de asignar_timeline():
        un proyecto cargado con código histórico nunca debe perder ese
        código, ni siquiera si después se le asigna un timeline.
        """
        proyecto = ProyectoService.crear(
            usuario_id=self.usuario_proyecto.pk,
            gerente_id=self.gerente.pk,
            titulo='Proyecto Histórico con Timeline Posterior',
            interno=True,
            alianza=False,
            financiado=True,
            unidad_ejecutora='ING',
            linea_investigacion='Tecnología',
            ejecutor=self.ejecutor,
            codigo='ING2018-E07',
            estado_aprobado='APROBADO',
        )
        actualizado = ProyectoService.asignar_timeline(
            proyecto_id=proyecto.pk,
            fecha_inicio=date(2018, 1, 1),
            fecha_fin=date(2018, 12, 31),
            ejecutor=self.ejecutor,
        )
        self.assertEqual(actualizado.codigo, 'ING2018-E07')

    def test_crear_proyecto_codigo_duplicado_falla(self):
        """
        Cubre que _validar_codigo() realmente se invoque: dos proyectos
        no pueden compartir el mismo código de repositorio.
        """
        ProyectoService.crear(
            usuario_id=self.usuario_proyecto.pk, gerente_id=self.gerente.pk,
            titulo='Primer Proyecto Histórico', interno=True, alianza=False,
            financiado=False, unidad_ejecutora='ING', linea_investigacion='Tecnología',
            ejecutor=self.ejecutor, codigo='ING2020-I01',
        )
        with self.assertRaises(ValidationError):
            ProyectoService.crear(
                usuario_id=self.usuario_proyecto.pk, gerente_id=self.gerente.pk,
                titulo='Segundo Proyecto Histórico', interno=True, alianza=False,
                financiado=False, unidad_ejecutora='ING', linea_investigacion='Tecnología',
                ejecutor=self.ejecutor, codigo='ING2020-I01',
            )