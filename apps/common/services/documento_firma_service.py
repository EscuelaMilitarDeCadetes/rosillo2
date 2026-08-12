import hashlib
from django.db import transaction
from apps.common.models import DocumentoFirma
from apps.common.selectors.documento_firma_selector import DocumentoFirmaSelector
from apps.common.validators.documento_firma_validator import DocumentoFirmaValidator
from apps.common.services.historial_service import HistorialService
from rest_framework.exceptions import ValidationError

from django.core.files.storage import default_storage
from django.core.files.base import ContentFile


class DocumentoFirmaService:
    @staticmethod
    def listar():
        return DocumentoFirmaSelector.listar()

    @staticmethod
    def obtener(documento_firma_id):
        return DocumentoFirmaSelector.obtener(documento_firma_id)

    @staticmethod
    @transaction.atomic
    def crear(tipo_documento_id, ruta_documento, ip_creacion, ejecutor, objeto=None, estado='BORRADOR'):
        """
        `objeto` (opcional) es la instancia de negocio a la que pertenece este
        documento (Proyecto, Convocatoria, Presupuesto, ProcesoFormativo...).
        `estado`: 'BORRADOR' (default) para documentos nuevos que van a pasar
        por el flujo de firmas dentro de la plataforma. 'FIRMADO' para
        documentos del repositorio histórico (2020+) que ya vienen firmados
        (con todas o algunas firmas) fuera de la plataforma y no se espera
        que nadie los firme aquí.
        """
        ultima = DocumentoFirmaSelector.obtener_ultima_version(tipo_documento_id, objeto)
        version = (ultima.version + 1) if ultima else 1
        try:
            with open(ruta_documento, "rb") as archivo:
                hash_documento = hashlib.sha256(archivo.read()).hexdigest()
        except FileNotFoundError:
            raise ValidationError({
                "ruta_documento": (
                    f"No se encontró el archivo en la ruta '{ruta_documento}'. "
                    "El documento debe existir físicamente en disco antes de registrar su firma."
                )
            })
        datos = dict(
            tipo_documento_id=tipo_documento_id,
            version=version,
            ruta_documento=ruta_documento,
            estado=estado,
            hash_documento=hash_documento,
            ip_creacion=ip_creacion,
            habilitado_firma=False,
        )
        if objeto is not None:
            from django.contrib.contenttypes.models import ContentType
            datos["content_type"] = ContentType.objects.get_for_model(objeto)
            datos["object_id"] = objeto.pk

        DocumentoFirmaValidator.validar_creacion(
            tipo_documento_id, version, ruta_documento, hash_documento,
            datos.get("content_type"), datos.get("object_id"), estado=estado,
        )
        documento = DocumentoFirma.objects.create(**datos)
        HistorialService.registrar(
            ejecutor,
            f"Se creó el documento '{documento.tipo_documento.nombre_documento}' "
            f"versión {documento.version} en estado {estado} (id={documento.pk}).",
            objeto=documento,
        )
        return documento

    @staticmethod
    @transaction.atomic
    def crear_desde_archivo(tipo_documento_id, archivo, ip_creacion, ejecutor,
                             objeto=None, estado='BORRADOR', carpeta='documentos'):
        """
        Punto de entrada único para crear un DocumentoFirma a partir de un
        archivo subido por multipart (UploadedFile de Django), en vez de una
        ruta ya existente en disco. Centraliza la escritura física del
        archivo para que ConvocatoriaService, y en el futuro ProyectoService,
        PresupuestoService, ProcesoFormativoService, etc., no reimplementen
        default_storage.save() cada uno por su cuenta.
        `carpeta`: subcarpeta dentro de MEDIA_ROOT para organizar por
        dominio ('convocatorias', 'proyectos', 'presupuestos', ...).
        """
        ruta_relativa = default_storage.save(f"{carpeta}/{archivo.name}", ContentFile(archivo.read()))
        ruta_documento = default_storage.path(ruta_relativa)
        return DocumentoFirmaService.crear(
            tipo_documento_id=tipo_documento_id,
            ruta_documento=ruta_documento,
            ip_creacion=ip_creacion,
            ejecutor=ejecutor,
            objeto=objeto,
            estado=estado,
        )

    @staticmethod
    @transaction.atomic
    def habilitar_para_firma(documento_firma_id, ejecutor):
        documento = DocumentoFirmaSelector.obtener(documento_firma_id)
        DocumentoFirmaValidator.validar_cambio_estado(documento, 'EN_FIRMAS')
        documento.estado = 'EN_FIRMAS'
        documento.habilitado_firma = True
        documento.save(update_fields=['estado', 'habilitado_firma'])
        HistorialService.registrar(
            ejecutor,
            f"Se habilitó para firma el documento '{documento.tipo_documento.nombre_documento}' "
            f"versión {documento.version} (id={documento.pk}).",
            objeto=documento,
        )
        return documento

    @staticmethod
    @transaction.atomic
    def marcar_rechazado(documento_firma_id, ejecutor):
        documento = DocumentoFirmaSelector.obtener(documento_firma_id)
        DocumentoFirmaValidator.validar_cambio_estado(documento, 'RECHAZADO')
        documento.estado = 'RECHAZADO'
        documento.habilitado_firma = False
        documento.save(update_fields=['estado', 'habilitado_firma'])
        HistorialService.registrar(
            ejecutor,
            f"El documento '{documento.tipo_documento.nombre_documento}' versión "
            f"{documento.version} quedó en estado RECHAZADO (id={documento.pk}).",
            objeto=documento,
        )
        return documento

    @staticmethod
    @transaction.atomic
    def marcar_firmado_completamente(documento_firma_id, ejecutor):
        documento = DocumentoFirmaSelector.obtener(documento_firma_id)
        DocumentoFirmaValidator.validar_cambio_estado(documento, 'FIRMADO')
        documento.estado = 'FIRMADO'
        documento.habilitado_firma = False
        documento.save(update_fields=['estado', 'habilitado_firma'])
        HistorialService.registrar(
            ejecutor,
            f"El documento '{documento.tipo_documento.nombre_documento}' versión "
            f"{documento.version} quedó completamente FIRMADO (id={documento.pk}).",
            objeto=documento,
        )
        return documento

    @staticmethod
    @transaction.atomic
    def eliminar(documento_firma_id, ejecutor):
        documento = DocumentoFirmaSelector.obtener(documento_firma_id)
        DocumentoFirmaValidator.validar_eliminacion(documento)
        descripcion = (
            f"Se eliminó el documento '{documento.tipo_documento.nombre_documento}' "
            f"versión {documento.version} en estado BORRADOR (id={documento.pk})."
        )
        HistorialService.registrar(ejecutor, descripcion)
        documento.delete()
        return True

    @staticmethod
    def listar_por_tipo_documento(tipo_documento_id):
        return DocumentoFirmaSelector.listar_por_tipo_documento(tipo_documento_id)

    @staticmethod
    def obtener_ultima_version(tipo_documento_id, objeto=None):
        return DocumentoFirmaSelector.obtener_ultima_version(tipo_documento_id, objeto)

    @staticmethod
    def listar_habilitados_para_firma():
        return DocumentoFirmaSelector.listar_habilitados_para_firma()

    @staticmethod
    def listar_por_objeto(objeto):
        """Depende del campo content_type/object_id propuesto. 🔶"""
        return DocumentoFirmaSelector.listar_por_objeto(objeto)