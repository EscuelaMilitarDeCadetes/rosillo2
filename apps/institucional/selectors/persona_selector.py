"""
Selector de Persona.

Migrado desde: PersonaServicio (Thymeleaf)
    buscarPersona(id)        -> obtener(id)
    mostrarTodasPersonas()   -> listar()
    mostrarDatosPersona(correo) -> obtener_por_correo(correo) [ver nota]
    (repositorio) findByDocument(documento) -> obtener_por_documento(documento)

mostrarDatosPersona(correo) en el original navegaba Usuario.username
(=correo) -> Persona vía FK directo. Ahora Usuario ya no tiene ese FK
directo — la relación pasa por UsuarioXPersona. obtener_por_correo()
aquí se migra de forma literal contra Persona.correo (que es un campo
propio y real de Persona, independiente de cómo se resuelva el Usuario
asociado) — resolver "la Persona del Usuario actualmente logueado" es
una operación distinta que vive en UsuarioXPersona/usuarios, no aquí.

mostrarTodasPersonas() en el original hacía un INNER JOIN con
persona_x_grupo sin seleccionar columnas de esa tabla — en la práctica
eso filtraba implícitamente a "personas que tienen al menos un
PersonaXGrupo". Se decidió NO replicar ese filtro implícito: listar()
aquí devuelve TODAS las Personas, sin condición sobre PersonaXGrupo,
porque ese filtro era un efecto colateral de la query original, no una
regla de negocio declarada.
"""
from apps.institucional.models import Persona


class PersonaSelector:

    @staticmethod
    def listar():
        return Persona.objects.select_related('grado').all().order_by('apellido', 'nombre')

    @staticmethod
    def obtener(persona_id):
        return Persona.objects.select_related('grado').get(pk=persona_id)

    @staticmethod
    def buscar(persona_id):
        return Persona.objects.select_related('grado').filter(pk=persona_id).first()

    @staticmethod
    def existe(persona_id):
        return Persona.objects.filter(pk=persona_id).exists()

    @staticmethod
    def existe_documento(documento, excluir_id=None):
        qs = Persona.objects.filter(documento=documento)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def existe_celular(celular, excluir_id=None):
        qs = Persona.objects.filter(celular=celular)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()

    @staticmethod
    def existe_correo(correo, excluir_id=None):
        qs = Persona.objects.filter(correo__iexact=correo)
        if excluir_id is not None:
            qs = qs.exclude(pk=excluir_id)
        return qs.exists()