from rest_framework.exceptions import ValidationError

from apps.investigacion_formal.selectors.proyecto_selector import ProyectoSelector

ESTADOS_APROBADO_VALIDOS = {'SIN_CALIFICAR', 'APROBADO', 'NO_APROBADO'}


class ProyectoValidator:

    @staticmethod
    def validar_creacion(usuario_id, gerente_id, titulo, interno, alianza, financiado,
                      unidad_ejecutora, linea_investigacion,
                      estado_aprobado='SIN_CALIFICAR', codigo=None):
        ProyectoValidator._validar_usuario(usuario_id)
        ProyectoValidator._validar_gerente(gerente_id)
        ProyectoValidator._validar_titulo(titulo)
        ProyectoValidator._validar_booleano(interno, "interno")
        ProyectoValidator._validar_booleano(alianza, "alianza")
        ProyectoValidator._validar_booleano(financiado, "financiado")
        ProyectoValidator._validar_unidad_ejecutora(unidad_ejecutora)
        ProyectoValidator._validar_linea_investigacion(linea_investigacion)
        ProyectoValidator._validar_estado_aprobado(estado_aprobado)
        ProyectoValidator._validar_unicidad_titulo(titulo)
        if codigo:
            ProyectoValidator._validar_codigo(codigo)

    @staticmethod
    def validar_actualizacion(proyecto_id, titulo, unidad_ejecutora, linea_investigacion):
        ProyectoValidator._validar_titulo(titulo)
        ProyectoValidator._validar_unidad_ejecutora(unidad_ejecutora)
        ProyectoValidator._validar_linea_investigacion(linea_investigacion)
        ProyectoValidator._validar_unicidad_titulo(titulo, excluir_id=proyecto_id)

    @staticmethod
    def validar_asignacion_timeline(fecha_inicio, fecha_fin):
        """Réplica de asignarTimeline: fija fechas y genera el código consecutivo."""
        if not fecha_inicio or not fecha_fin:
            raise ValidationError(
                "Las fechas de inicio y fin del proyecto son obligatorias."
            )
        if fecha_fin < fecha_inicio:
            raise ValidationError(
                {"fecha_fin": "La fecha de fin no puede ser anterior a la fecha de inicio."}
            )

    @staticmethod
    def validar_edicion_fecha_cierre(proyecto, nueva_fecha_fin):
        """Réplica de editarFechaCierre: solo permite modificar fecha_fin de un
        proyecto que ya tiene fecha_inicio asignada."""
        if not proyecto.fecha_inicio:
            raise ValidationError(
                "No se puede editar la fecha de cierre de un proyecto que aún no "
                "tiene asignada una fecha de inicio."
            )
        if not nueva_fecha_fin:
            raise ValidationError({"fecha_fin": "La nueva fecha de cierre es obligatoria."})
        if nueva_fecha_fin < proyecto.fecha_inicio:
            raise ValidationError(
                {"fecha_fin": "La fecha de cierre no puede ser anterior a la fecha de inicio."}
            )

    @staticmethod
    def validar_cambio_estado_aprobado(nuevo_estado_aprobado):
        ProyectoValidator._validar_estado_aprobado(nuevo_estado_aprobado)

    @staticmethod
    def validar_subida_gruplac(proyecto):
        if proyecto.gruplac:
            raise ValidationError("Este proyecto ya fue cargado al GrupLAC.")

    @staticmethod
    def validar_registro_acta_cierre(proyecto):
        if proyecto.registro_acta_cierre:
            raise ValidationError("Este proyecto ya tiene registrada su acta de cierre.")

    @staticmethod
    def validar_eliminacion(proyecto):
        if not proyecto.estado:
            raise ValidationError("Este proyecto ya se encuentra desactivado.")

    @staticmethod
    def _validar_usuario(usuario_id):
        if not usuario_id:
            raise ValidationError({"usuario": "El usuario responsable del proyecto es obligatorio."})

    @staticmethod
    def _validar_gerente(gerente_id):
        if not gerente_id:
            raise ValidationError({"gerente": "El gerente responsable del proyecto es obligatorio."})

    @staticmethod
    def _validar_titulo(titulo):
        if not titulo or not titulo.strip():
            raise ValidationError({"titulo": "El título del proyecto es obligatorio."})
        if len(titulo) > 2000:
            raise ValidationError({"titulo": "El título supera el máximo de 2000 caracteres."})

    @staticmethod
    def _validar_booleano(valor, campo):
        if valor is None:
            raise ValidationError({campo: f"El campo '{campo}' es obligatorio."})

    @staticmethod
    def _validar_unidad_ejecutora(unidad_ejecutora):
        if not unidad_ejecutora or not unidad_ejecutora.strip():
            raise ValidationError({"unidad_ejecutora": "La unidad ejecutora es obligatoria."})
        if len(unidad_ejecutora) > 10:
            raise ValidationError(
                {"unidad_ejecutora": "La unidad ejecutora supera el máximo de 10 caracteres."}
            )

    @staticmethod
    def _validar_linea_investigacion(linea_investigacion):
        if not linea_investigacion or not linea_investigacion.strip():
            raise ValidationError({"linea_investigacion": "La línea de investigación es obligatoria."})
        if len(linea_investigacion) > 100:
            raise ValidationError(
                {"linea_investigacion": "La línea de investigación supera el máximo de 100 caracteres."}
            )

    @staticmethod
    def _validar_estado_aprobado(estado_aprobado):
        if estado_aprobado not in ESTADOS_APROBADO_VALIDOS:
            raise ValidationError(
                {"estado_aprobado": (
                    f"'{estado_aprobado}' no es un estado válido. "
                    f"Use uno de: {sorted(ESTADOS_APROBADO_VALIDOS)}."
                )}
            )

    @staticmethod
    def _validar_unicidad_titulo(titulo, excluir_id=None):
        if ProyectoSelector.existe_titulo(titulo, excluir_id=excluir_id):
            raise ValidationError(
                {"titulo": f"Ya existe un proyecto registrado con el título '{titulo}'."}
            )
    
    @staticmethod
    def _validar_codigo(codigo):
        if len(codigo) > 50:
            raise ValidationError({"codigo": "El código supera el máximo de 50 caracteres."})
        if ProyectoSelector.existe_codigo(codigo):
            raise ValidationError(
                {"codigo": f"Ya existe un proyecto registrado con el código '{codigo}'."}
            )