from rest_framework.exceptions import ValidationError

from apps.investigacion_formal.selectors.producto_x_grupo_selector import ProductoXGrupoSelector
from apps.investigacion_formal.selectors.proyecto_selector import ProyectoSelector
from apps.investigacion_formal.selectors.producto_x_proyecto_selector import ProductoXProyectoSelector

CATEGORIAS_VALIDAS_MAX_LEN = 30


class ProductoXProyectoValidator:

    @staticmethod
    def validar_creacion(producto_x_grupo_id, proyecto_id, categoria, puntaje, tipo_documento_id=None):
        ProductoXProyectoValidator._validar_producto_x_grupo(producto_x_grupo_id)
        ProductoXProyectoValidator._validar_proyecto(proyecto_id)
        ProductoXProyectoValidator._validar_categoria(categoria)
        ProductoXProyectoValidator._validar_puntaje(puntaje)
        ProductoXProyectoValidator._validar_unicidad(
            producto_x_grupo_id, proyecto_id, tipo_documento_id
        )

    @staticmethod
    def validar_actualizacion(producto_x_proyecto_id, producto_x_grupo_id, proyecto_id,
                               categoria, puntaje, tipo_documento_id=None):
        ProductoXProyectoValidator._validar_producto_x_grupo(producto_x_grupo_id)
        ProductoXProyectoValidator._validar_proyecto(proyecto_id)
        ProductoXProyectoValidator._validar_categoria(categoria)
        ProductoXProyectoValidator._validar_puntaje(puntaje)
        ProductoXProyectoValidator._validar_unicidad(
            producto_x_grupo_id, proyecto_id, tipo_documento_id,
            excluir_id=producto_x_proyecto_id,
        )

    @staticmethod
    def validar_entrega(documento, tipo_documento_id):
        """Reglas para cargarDocumentoProducto: al marcar un producto como
        entregado, el documento y su tipo son obligatorios."""
        if not documento or not documento.strip():
            raise ValidationError({"documento": "El documento del producto entregado es obligatorio."})
        if not tipo_documento_id:
            raise ValidationError({"tipo_documento": "El tipo de documento entregado es obligatorio."})

    @staticmethod
    def validar_eliminacion(producto_x_proyecto):
        if not producto_x_proyecto.activo:
            raise ValidationError("Este producto ya se encuentra desactivado.")

    @staticmethod
    def _validar_producto_x_grupo(producto_x_grupo_id):
        if not producto_x_grupo_id:
            raise ValidationError({"producto_x_grupo": "El producto Minciencias del grupo es obligatorio."})
        if not ProductoXGrupoSelector.existe(producto_x_grupo_id):
            raise ValidationError(
                {"producto_x_grupo": f"No existe un ProductoXGrupo con id={producto_x_grupo_id}."}
            )

    @staticmethod
    def _validar_proyecto(proyecto_id):
        if not proyecto_id:
            raise ValidationError({"proyecto": "El proyecto es obligatorio."})
        if not ProyectoSelector.existe(proyecto_id):
            raise ValidationError({"proyecto": f"No existe un Proyecto con id={proyecto_id}."})

    @staticmethod
    def _validar_categoria(categoria):
        if not categoria or not categoria.strip():
            raise ValidationError({"categoria": "La categoría del producto es obligatoria."})
        if len(categoria) > CATEGORIAS_VALIDAS_MAX_LEN:
            raise ValidationError(
                {"categoria": f"La categoría supera el máximo de {CATEGORIAS_VALIDAS_MAX_LEN} caracteres."}
            )

    @staticmethod
    def _validar_puntaje(puntaje):
        if puntaje is None:
            raise ValidationError({"puntaje": "El puntaje del producto es obligatorio."})
        if not isinstance(puntaje, int) or puntaje < 0:
            raise ValidationError({"puntaje": "El puntaje debe ser un entero no negativo."})

    @staticmethod
    def _validar_unicidad(producto_x_grupo_id, proyecto_id, tipo_documento_id, excluir_id=None):
        if ProductoXProyectoSelector.existe_combinacion(
            producto_x_grupo_id, proyecto_id, tipo_documento_id, excluir_id=excluir_id
        ):
            raise ValidationError(
                "Ya existe este mismo producto registrado para este proyecto con "
                "el mismo tipo de documento."
            )