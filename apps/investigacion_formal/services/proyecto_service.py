from datetime import datetime

from django.db import transaction

from apps.investigacion_formal.models import Proyecto
from apps.investigacion_formal.selectors.proyecto_selector import ProyectoSelector
from apps.investigacion_formal.validators.proyecto_validator import ProyectoValidator
from apps.common.services.historial_service import HistorialService
from django.utils import timezone
from apps.investigacion_formal.models import Monto
from apps.investigacion_formal.selectors.convocatoria_selector import ConvocatoriaSelector
from apps.investigacion_formal.services.convocatoria_service import ConvocatoriaService
from apps.investigacion_formal.services.proyecto_x_convocatoria_service import (
    ProyectoXConvocatoriaService,
)


class ProyectoService:

    @staticmethod
    def listar():
        return ProyectoSelector.listar()

    @staticmethod
    def listar_activos():
        return ProyectoSelector.listar_activos()

    @staticmethod
    def obtener(proyecto_id):
        return ProyectoSelector.obtener(proyecto_id)

    @staticmethod
    def listar_por_usuario(usuario_id):
        return ProyectoSelector.listar_por_usuario(usuario_id)

    @staticmethod
    def listar_por_facultad(facultad_id):
        return ProyectoSelector.listar_por_facultad(facultad_id)

    @staticmethod
    def listar_por_grupo(grupo_id):
        return ProyectoSelector.listar_por_grupo(grupo_id)

    @staticmethod
    def listar_por_estado_aprobado(estado_aprobado):
        return ProyectoSelector.listar_por_estado_aprobado(estado_aprobado)

    @staticmethod
    @transaction.atomic
    def crear(usuario_id, gerente_id, titulo, interno, alianza, financiado,
            unidad_ejecutora, linea_investigacion, ejecutor, codigo=None,
            estado_aprobado='SIN_CALIFICAR', fecha_inicio=None, fecha_fin=None):
        """
        codigo=None            -> proyecto NUEVO: el código se genera automáticamente
                                la primera vez que se llame a asignar_timeline().
        codigo='ING2019-I03'   -> carga de REPOSITORIO histórico: se respeta el
                                código ya existente y nunca se regenera.
        """
        ProyectoValidator.validar_creacion(
            usuario_id, gerente_id, titulo, interno, alianza, financiado,
            unidad_ejecutora, linea_investigacion,
            estado_aprobado=estado_aprobado, codigo=codigo,
        )
        proyecto = Proyecto.objects.create(
            usuario_id=usuario_id,
            gerente_id=gerente_id,
            titulo=titulo.strip(),
            interno=interno,
            registro_acta_cierre=False,
            alianza=alianza,
            estado=True,
            estado_aprobado=estado_aprobado,
            financiado=financiado,
            unidad_ejecutora=unidad_ejecutora.strip(),
            linea_investigacion=linea_investigacion.strip(),
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            codigo=(codigo or '').strip(),
            gruplac=False,
        )
        if codigo:
            HistorialService.registrar(
                ejecutor,
                f"Se importó al repositorio el proyecto '{proyecto.titulo}' "
                f"con código histórico '{proyecto.codigo}' (id={proyecto.pk}).",
                objeto=proyecto,
            )
        else:
            HistorialService.registrar(
                ejecutor,
                f"Se creó el proyecto '{proyecto.titulo}' (id={proyecto.pk}).",
                objeto=proyecto,
            )
        return proyecto

    @staticmethod
    @transaction.atomic
    def actualizar(proyecto_id, titulo, unidad_ejecutora, linea_investigacion, ejecutor):
        """Exclusivo de CINTERNO/CEXTERNO."""
        proyecto = ProyectoSelector.obtener(proyecto_id)
        ProyectoValidator.validar_actualizacion(
            proyecto_id, titulo, unidad_ejecutora, linea_investigacion
        )
        proyecto.titulo = titulo.strip()
        proyecto.unidad_ejecutora = unidad_ejecutora.strip()
        proyecto.linea_investigacion = linea_investigacion.strip()
        proyecto.save(update_fields=['titulo', 'unidad_ejecutora', 'linea_investigacion'])
        HistorialService.registrar(
            ejecutor,
            f"Se actualizó el proyecto '{proyecto.titulo}' (id={proyecto.pk}).",
            objeto=proyecto,
        )
        return proyecto

    @staticmethod
    @transaction.atomic
    def asignar_timeline(proyecto_id, fecha_inicio, fecha_fin, ejecutor):
        if isinstance(fecha_inicio, str):
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
        if isinstance(fecha_fin, str):
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
        proyecto = ProyectoSelector.obtener(proyecto_id)
        ProyectoValidator.validar_asignacion_timeline(fecha_inicio, fecha_fin)
        proyecto.fecha_inicio = fecha_inicio
        proyecto.fecha_fin = fecha_fin
        campos_a_guardar = ['fecha_inicio', 'fecha_fin']

        # Regla de repositorio: si el proyecto YA tiene código (carga histórica,
        # o ya se le generó antes), nunca se regenera ni se sobreescribe.
        if not proyecto.codigo:
            anio = fecha_inicio.year
            prefijo = f"{proyecto.unidad_ejecutora}{anio}-{'I' if proyecto.interno else 'E'}"
            cantidad = ProyectoSelector.contar_aprobados_por_prefijo(prefijo)
            proyecto.codigo = f"{prefijo}{cantidad + 1:02d}"
            campos_a_guardar.append('codigo')

        proyecto.save(update_fields=campos_a_guardar)
        HistorialService.registrar(
            ejecutor,
            f"Se asignó el tiempo de ejecución al proyecto '{proyecto.titulo}' "
            f"(código={proyecto.codigo}).",
            objeto=proyecto,
        )
        return proyecto

    @staticmethod
    @transaction.atomic
    def editar_fecha_cierre(proyecto_id, nueva_fecha_fin, ejecutor):
        """Réplica de editarFechaCierre."""
        if isinstance(nueva_fecha_fin, str):
            nueva_fecha_fin = datetime.strptime(nueva_fecha_fin, '%Y-%m-%d').date()
        proyecto = ProyectoSelector.obtener(proyecto_id)
        ProyectoValidator.validar_edicion_fecha_cierre(proyecto, nueva_fecha_fin)
        proyecto.fecha_fin = nueva_fecha_fin
        proyecto.save(update_fields=['fecha_fin'])
        HistorialService.registrar(
            ejecutor,
            f"Se cambió la fecha de cierre del proyecto '{proyecto.titulo}' "
            f"a {nueva_fecha_fin}.",
            objeto=proyecto,
        )
        return proyecto

    @staticmethod
    @transaction.atomic
    def cambiar_estado_aprobado(proyecto_id, nuevo_estado_aprobado, ejecutor):
        proyecto = ProyectoSelector.obtener(proyecto_id)
        ProyectoValidator.validar_cambio_estado_aprobado(nuevo_estado_aprobado)
        proyecto.estado_aprobado = nuevo_estado_aprobado
        proyecto.save(update_fields=['estado_aprobado'])
        HistorialService.registrar(
            ejecutor,
            f"Se cambió el estado de aprobación del proyecto '{proyecto.titulo}' "
            f"a {nuevo_estado_aprobado}.",
            objeto=proyecto,
        )
        return proyecto

    @staticmethod
    @transaction.atomic
    def subir_a_gruplac(proyecto_id, ejecutor):
        proyecto = ProyectoSelector.obtener(proyecto_id)
        ProyectoValidator.validar_subida_gruplac(proyecto)
        proyecto.gruplac = True
        proyecto.save(update_fields=['gruplac'])
        HistorialService.registrar(
            ejecutor,
            f"Se cargó el proyecto '{proyecto.titulo}' al GrupLAC.",
            objeto=proyecto,
        )
        return proyecto

    @staticmethod
    @transaction.atomic
    def registrar_acta_cierre(proyecto_id, ejecutor):
        proyecto = ProyectoSelector.obtener(proyecto_id)
        ProyectoValidator.validar_registro_acta_cierre(proyecto)
        proyecto.registro_acta_cierre = True
        proyecto.estado = False
        proyecto.save(update_fields=['registro_acta_cierre', 'estado'])
        HistorialService.registrar(
            ejecutor,
            f"Se registró el acta de cierre del proyecto '{proyecto.titulo}' "
            f"y se cerró definitivamente.",
            objeto=proyecto,
        )
        return proyecto

    @staticmethod
    @transaction.atomic
    def eliminar(proyecto_id, ejecutor):
        """Soft-delete; exclusivo de CINTERNO/CEXTERNO."""
        proyecto = ProyectoSelector.obtener(proyecto_id)
        ProyectoValidator.validar_eliminacion(proyecto)
        proyecto.estado = False
        proyecto.save(update_fields=['estado'])
        HistorialService.registrar(
            ejecutor,
            f"Se desactivó el proyecto '{proyecto.titulo}' (id={proyecto.pk}).",
            objeto=proyecto,
        )
        return proyecto    
    
    @staticmethod
    @transaction.atomic
    def crear_proyecto_externo(usuario_id, gerente_id, titulo, unidad_ejecutora,
                                linea_investigacion, entidad, valor_solicitado,
                                alianza, financiado, ejecutor):
        """
        Réplica de ProyectosExternosControlador.crearProyecto() +
        ProyectoServicioImpl.crearProyecto() del Thymeleaf original.

        Regla de negocio (01_architecture.md, flujo de investigación formal,
        paso 5): los proyectos de convocatoria externa se aprueban
        automáticamente, sin pasar por las 6 fases de Calificacion que sí
        aplican a los proyectos internos.
        """
        anio_actual = timezone.now().year
        nombre_convocatoria_externa = f"{entidad} {anio_actual}"
        convocatoria = ConvocatoriaSelector.buscar_por_nombre(
            nombre_convocatoria_externa
        )
        if convocatoria is None:
            convocatoria = ConvocatoriaService.crear(
                nombre_convocatoria=nombre_convocatoria_externa,
                anio_convocatoria=anio_actual,
                inicio=timezone.now().date(),
                cierre=timezone.now().date(),
                interno=False,
                ejecutor=ejecutor,
            )
            # Las convocatorias externas sintéticas nacen inactivas: no son
            # una convocatoria "real" abierta a postulación, solo agrupan
            # proyectos externos para reportes homogéneos con los internos.
            ConvocatoriaService.cambiar_estado(
                convocatoria_id=convocatoria.pk, nuevo_estado=False, ejecutor=ejecutor,
            )
        proyecto = ProyectoService.crear(
            usuario_id=usuario_id,
            gerente_id=gerente_id,
            titulo=titulo,
            interno=False,
            alianza=alianza,
            financiado=financiado,
            unidad_ejecutora=unidad_ejecutora,
            linea_investigacion=linea_investigacion,
            ejecutor=ejecutor,
            estado_aprobado='APROBADO',  # auto-aprobación, regla de negocio
        )
        Monto.objects.create(
            proyecto=proyecto,
            solicitado=valor_solicitado or 0,
            aprobado=valor_solicitado or 0,
            asignado=timezone.now().date(),
            ejecutado=0,
        )
        # Nace "ya calificado": no pasa por las 6 fases de Calificacion.
        ProyectoXConvocatoriaService.crear_ya_finalizado_aprobado(
            proyecto_id=proyecto.pk,
            convocatoria_id=convocatoria.pk,
            ejecutor=ejecutor,
        )
        HistorialService.registrar(
            ejecutor,
            f"Se creó el proyecto externo '{proyecto.titulo}' con "
            f"aprobación automática (entidad='{entidad}').",
            objeto=proyecto,
        )
        return proyecto
