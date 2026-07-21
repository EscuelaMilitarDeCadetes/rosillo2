"""
Selector de integración.

Lee datos transversales que cruzan usuarios e institucional.
Solo lectura — no escribe en ninguna tabla.
"""
from django.contrib.auth import get_user_model

from apps.usuarios.models import RolXUsuario, UsuarioXPersona
from apps.institucional.selectors.persona_x_grupo_selector import PersonaXGrupoSelector

User = get_user_model()


class VinculacionSelector:

    @staticmethod
    def usuario_tiene_persona(usuario_id: int) -> bool:
        return UsuarioXPersona.objects.filter(
            usuario_id=usuario_id, estado=True
        ).exists()

    @staticmethod
    def obtener_persona_usuario(usuario_id: int):
        """Devuelve la Persona activa asignada al usuario, o None."""
        asignacion = (
            UsuarioXPersona.objects
            .select_related('persona')
            .filter(usuario_id=usuario_id, estado=True)
            .first()
        )
        return asignacion.persona if asignacion else None

    @staticmethod
    def obtener_rol_plataforma(usuario_id: int):
        """Devuelve el primer RolPlataforma activo del usuario, o None."""
        rxu = (
            RolXUsuario.objects
            .select_related('rol')
            .filter(usuario_id=usuario_id, estado=True)
            .first()
        )
        return rxu.rol if rxu else None

    @staticmethod
    def obtener_roles_plataforma(usuario_id: int):
        """Devuelve todos los RolPlataforma activos del usuario."""
        return (
            RolXUsuario.objects
            .select_related('rol')
            .filter(usuario_id=usuario_id, estado=True)
        )

    @staticmethod
    def obtener_vinculacion_activa(usuario_id: int):
        """Devuelve el UsuarioXPersona activo, o None."""
        return (
            UsuarioXPersona.objects
            .select_related('persona')
            .filter(usuario_id=usuario_id, estado=True)
            .first()
        )

    @staticmethod
    def obtener_facultad(usuario_id: int):
        """
        Facultad activa de la persona asignada al usuario.
        Navega: Usuario -> UsuarioXPersona -> Persona -> PersonaXGrupo.
        """
        persona = VinculacionSelector.obtener_persona_usuario(usuario_id)
        if persona is None:
            return None
        return PersonaXGrupoSelector.obtener_facultad_activa_de_persona(persona.pk)

    @staticmethod
    def obtener_grupo(usuario_id: int):
        """
        Grupo activo de la persona asignada al usuario.
        """
        persona = VinculacionSelector.obtener_persona_usuario(usuario_id)
        if persona is None:
            return None
        fila = (
            PersonaXGrupoSelector.listar_persona_activa(persona.pk)
            .filter(grupo__isnull=False)
            .select_related('grupo')
            .first()
        )
        return fila.grupo if fila else None

    @staticmethod
    def usuario_activo(usuario_id: int) -> bool:
        return User.objects.filter(pk=usuario_id, is_active=True).exists()

    @staticmethod
    def tiene_rol(usuario_id: int, nombre_rol: str) -> bool:
        return RolXUsuario.objects.filter(
            usuario_id=usuario_id,
            rol__nombre_rol=nombre_rol,
            estado=True,
        ).exists()