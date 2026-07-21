"""
Service de Persona.

Interfaz: listar(), obtener(id), crear(...), actualizar(id, ...).
NO existe eliminar() — Persona es un registro permanente.

ALCANCE DELIBERADAMENTE ACOTADO: este Service SOLO crea/actualiza el
registro Persona. NO crea Usuario, NO asigna RolXUsuario, NO crea
PersonaXGrupo. Eso es responsabilidad de una capa orquestadora superior
(en apps.usuarios o un endpoint compuesto), según la decisión de
arquitectura ya tomada: la creación de Usuario+Rol no pertenece a
institucional.

Migrado desde: PersonaServicio (Thymeleaf)
    buscarPersona(id) -> obtener(id)
    mostrarTodasPersonas() -> listar()
    guardarPersonaSinGrupoNiFacultad/ConGrupo/ConFacultad -> crear()
        (la parte de creación de Persona se conserva; la creación de
        Usuario+RolXUsuario+PersonaXGrupo que hacían esos 3 métodos en
        cascada ya NO vive aquí).
"""
from django.db import transaction

from apps.institucional.models import Persona
from apps.institucional.selectors.persona_selector import PersonaSelector
from apps.institucional.validators.persona_validator import PersonaValidator
from apps.common.services.historial_service import HistorialService


class PersonaService:

    @staticmethod
    def listar():
        return PersonaSelector.listar()

    @staticmethod
    def obtener(persona_id):
        return PersonaSelector.obtener(persona_id)

    @staticmethod
    @transaction.atomic
    def crear(grado_id, nombre, apellido, documento, celular, correo, ejecutor, cvlac=None):
        PersonaValidator.validar_creacion(grado_id, nombre, apellido, documento, celular, correo, cvlac)
        persona = Persona.objects.create(
            grado_id=grado_id,
            nombre=nombre.strip(),
            apellido=apellido.strip(),
            documento=documento.strip(),
            celular=celular.strip(),
            correo=correo.strip().lower(),
            cvlac=cvlac.strip() if cvlac else None,
        )
        HistorialService.registrar(
            ejecutor,
            f"Se registró la persona '{persona.nombre} {persona.apellido}' "
            f"(documento={persona.documento}, id={persona.pk}).",
        )
        return persona

    @staticmethod
    @transaction.atomic
    def actualizar(persona_id, ejecutor, grado_id=None, nombre=None, apellido=None,
                    documento=None, celular=None, correo=None, cvlac=None):
        persona = PersonaSelector.obtener(persona_id)

        nuevo_grado_id = grado_id if grado_id is not None else persona.grado_id
        nuevo_nombre = nombre if nombre is not None else persona.nombre
        nuevo_apellido = apellido if apellido is not None else persona.apellido
        nuevo_documento = documento if documento is not None else persona.documento
        nuevo_celular = celular if celular is not None else persona.celular
        nuevo_correo = correo if correo is not None else persona.correo
        nuevo_cvlac = cvlac if cvlac is not None else persona.cvlac

        PersonaValidator.validar_actualizacion(
            persona_id, nuevo_grado_id, nuevo_nombre, nuevo_apellido,
            nuevo_documento, nuevo_celular, nuevo_correo, nuevo_cvlac,
        )

        persona.grado_id = nuevo_grado_id
        persona.nombre = nuevo_nombre.strip()
        persona.apellido = nuevo_apellido.strip()
        persona.documento = nuevo_documento.strip()
        persona.celular = nuevo_celular.strip()
        persona.correo = nuevo_correo.strip().lower()
        persona.cvlac = nuevo_cvlac.strip() if nuevo_cvlac else None
        persona.save(update_fields=[
            "grado", "nombre", "apellido", "documento", "celular", "correo", "cvlac",
        ])

        HistorialService.registrar(
            ejecutor,
            f"Se actualizaron los datos de la persona "
            f"'{persona.nombre} {persona.apellido}' (id={persona.pk}).",
        )
        return persona