from django.db import transaction
from django.contrib.contenttypes.models import ContentType
from apps.common.models import Tarea
from apps.common.selectors.tarea_selector import TareaSelector
from apps.common.validators.tarea_validator import TareaValidator
from apps.common.services.historial_service import HistorialService


class TareaService:
    @staticmethod
    def listar():
        return TareaSelector.listar()

    @staticmethod
    def obtener(tarea_id):
        return TareaSelector.obtener(tarea_id)

    @staticmethod
    @transaction.atomic
    def crear(asignado_a_id, descripcion, objeto, ejecutor, fecha_limite=None):
        content_type = ContentType.objects.get_for_model(objeto)
        TareaValidator.validar_creacion(asignado_a_id, descripcion, content_type.pk, objeto.pk)
        tarea = Tarea.objects.create(
            asignado_a_id=asignado_a_id,
            descripcion=descripcion.strip(),
            content_type=content_type,
            object_id=objeto.pk,
            fecha_limite=fecha_limite,
        )
        HistorialService.registrar(
            ejecutor,
            f"Se asignó la tarea '{tarea.descripcion}' al usuario id={asignado_a_id} "
            f"(fecha límite={fecha_limite}, id={tarea.pk}).",
            objeto=tarea,
        )
        return tarea

    @staticmethod
    @transaction.atomic
    def reasignar(tarea_id, nuevo_asignado_a_id, ejecutor):
        tarea = TareaSelector.obtener(tarea_id)
        TareaValidator._validar_asignado(nuevo_asignado_a_id)
        anterior = tarea.asignado_a.username
        tarea.asignado_a_id = nuevo_asignado_a_id
        tarea.save(update_fields=['asignado_a'])
        HistorialService.registrar(
            ejecutor,
            f"Se reasignó la tarea '{tarea.descripcion}' de '{anterior}' "
            f"al usuario id={nuevo_asignado_a_id} (id={tarea.pk}).",
            objeto=tarea,
        )
        return tarea

    @staticmethod
    @transaction.atomic
    def completar(tarea_id, ejecutor):
        tarea = TareaSelector.obtener(tarea_id)
        TareaValidator.validar_completar(tarea)
        tarea.completada = True
        tarea.save(update_fields=['completada'])
        HistorialService.registrar(
            ejecutor,
            f"Se completó la tarea '{tarea.descripcion}' asignada a "
            f"'{tarea.asignado_a.username}' (id={tarea.pk}).",
            objeto=tarea,
        )
        return tarea

    @staticmethod
    @transaction.atomic
    def eliminar(tarea_id, ejecutor):
        tarea = TareaSelector.obtener(tarea_id)
        TareaValidator.validar_eliminacion(tarea)
        descripcion = f"Se eliminó la tarea '{tarea.descripcion}' (id={tarea.pk})."
        HistorialService.registrar(ejecutor, descripcion)
        tarea.delete()
        return True

    @staticmethod
    def listar_por_usuario(usuario_id, solo_pendientes=False):
        return TareaSelector.listar_por_usuario(usuario_id, solo_pendientes=solo_pendientes)

    @staticmethod
    def listar_por_objeto(objeto):
        return TareaSelector.listar_por_objeto(objeto)

    @staticmethod
    def listar_vencidas():
        return TareaSelector.listar_vencidas()

    @staticmethod
    def listar_proximas_a_vencer(dias=3):
        return TareaSelector.listar_proximas_a_vencer(dias=dias)