from django.db import transaction

from apps.investigacion_formal.models import ProductoXProyecto
from apps.investigacion_formal.selectors.producto_x_proyecto_selector import (
    ProductoXProyectoSelector,
)
from apps.investigacion_formal.validators.producto_x_proyecto_validator import (
    ProductoXProyectoValidator,
)
from apps.common.services.historial_service import HistorialService


class ProductoXProyectoService:

    @staticmethod
    def listar():
        return ProductoXProyectoSelector.listar()

    @staticmethod
    def obtener(producto_x_proyecto_id):
        return ProductoXProyectoSelector.obtener(producto_x_proyecto_id)

    @staticmethod
    def listar_por_proyecto(proyecto_id, solo_activos=True):
        return ProductoXProyectoSelector.listar_por_proyecto(proyecto_id, solo_activos=solo_activos)

    @staticmethod
    def listar_pendientes_por_proyecto(proyecto_id):
        return ProductoXProyectoSelector.listar_pendientes_por_proyecto(proyecto_id)

    @staticmethod
    def listar_entregados_por_proyecto(proyecto_id):
        return ProductoXProyectoSelector.listar_entregados_por_proyecto(proyecto_id)

    @staticmethod
    @transaction.atomic
    def crear(producto_x_grupo_id, proyecto_id, categoria, puntaje, ejecutor):
        """Réplica de agregarProductoXProyecto: registra la producción
        prometida/esperada, aún sin entregar."""
        ProductoXProyectoValidator.validar_creacion(
            producto_x_grupo_id, proyecto_id, categoria, puntaje
        )
        producto = ProductoXProyecto.objects.create(
            producto_x_grupo_id=producto_x_grupo_id,
            proyecto_id=proyecto_id,
            categoria=categoria.strip(),
            puntaje=puntaje,
            activo=True,
            entregado=False,
            gruplac=False,
        )
        HistorialService.registrar(
            ejecutor,
            f"Se asignó el producto "
            f"'{producto.producto_x_grupo.producto_minciencias.nombre_producto}' "
            f"al proyecto '{producto.proyecto.titulo}' (id={producto.pk}).",
            objeto=producto,
        )
        return producto

    @staticmethod
    @transaction.atomic
    def registrar_entrega(producto_x_proyecto_id, documento, tipo_documento_id, ejecutor):
        """Réplica de cargarDocumentoProducto: marca el producto como entregado
        y asocia el documento cargado."""
        producto = ProductoXProyectoSelector.obtener(producto_x_proyecto_id)
        ProductoXProyectoValidator.validar_entrega(documento, tipo_documento_id)

        producto.documento = documento
        producto.tipo_documento_id = tipo_documento_id
        producto.entregado = True
        producto.save(update_fields=['documento', 'tipo_documento', 'entregado'])

        HistorialService.registrar(
            ejecutor,
            f"Se registró la entrega del producto "
            f"'{producto.producto_x_grupo.producto_minciencias.nombre_producto}' "
            f"del proyecto '{producto.proyecto.titulo}' (id={producto.pk}).",
            objeto=producto,
        )
        return producto

    @staticmethod
    @transaction.atomic
    def subir_a_gruplac(producto_x_proyecto_id, ejecutor):
        producto = ProductoXProyectoSelector.obtener(producto_x_proyecto_id)
        producto.gruplac = True
        producto.save(update_fields=['gruplac'])
        HistorialService.registrar(
            ejecutor,
            f"Se cargó al GrupLAC el producto "
            f"'{producto.producto_x_grupo.producto_minciencias.nombre_producto}' "
            f"del proyecto '{producto.proyecto.titulo}' (id={producto.pk}).",
            objeto=producto,
        )
        return producto

    @staticmethod
    @transaction.atomic
    def actualizar(producto_x_proyecto_id, ejecutor, categoria=None, puntaje=None):
        producto = ProductoXProyectoSelector.obtener(producto_x_proyecto_id)

        nueva_categoria = categoria if categoria is not None else producto.categoria
        nuevo_puntaje = puntaje if puntaje is not None else producto.puntaje

        ProductoXProyectoValidator.validar_actualizacion(
            producto_x_proyecto_id,
            producto.producto_x_grupo_id,
            producto.proyecto_id,
            nueva_categoria,
            nuevo_puntaje,
            producto.tipo_documento_id,
        )

        producto.categoria = nueva_categoria.strip()
        producto.puntaje = nuevo_puntaje
        producto.save(update_fields=['categoria', 'puntaje'])

        HistorialService.registrar(
            ejecutor,
            f"Se actualizó el producto id={producto.pk} del proyecto "
            f"'{producto.proyecto.titulo}'.",
            objeto=producto,
        )
        return producto

    @staticmethod
    @transaction.atomic
    def eliminar(producto_x_proyecto_id, ejecutor):
        producto = ProductoXProyectoSelector.obtener(producto_x_proyecto_id)
        ProductoXProyectoValidator.validar_eliminacion(producto)
        producto.activo = False
        producto.save(update_fields=['activo'])
        HistorialService.registrar(
            ejecutor,
            f"Se desactivó el producto "
            f"'{producto.producto_x_grupo.producto_minciencias.nombre_producto}' "
            f"del proyecto '{producto.proyecto.titulo}' (id={producto.pk}).",
            objeto=producto,
        )
        return producto