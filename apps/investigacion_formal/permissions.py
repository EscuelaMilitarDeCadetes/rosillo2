"""
Combinaciones de permisos reutilizadas por múltiples ViewSets del módulo
investigacion_formal. Existe para evitar que la misma combinación de roles
se repita textualmente en 10 archivos distintos (ver hallazgo INV-11 de la
auditoría V2): un cambio de política de roles se hace UNA vez aquí, no en
cada ViewSet.

IMPORTANTE: estas son listas de CLASES de permiso (no instancias). Cada
ViewSet las combina con | dentro de su propio get_permissions(), igual que
antes — este archivo no cambia el comportamiento, solo centraliza la lista.
"""
from apps.usuarios.permissions import (
    EsFacultad, EsGrupo, EsCInterno, EsCExterno,
    EsAsesor, EsSupervisor, EsDecano, EsGerente, EsSoporte,
)

# Roles operativos que pueden CONSULTAR (list/retrieve) la mayoría de
# recursos de investigacion_formal: todo el que participa del flujo de
# investigación formal en algún rol.
ROLES_LECTURA_INVESTIGACION_FORMAL = [
    EsFacultad, EsGrupo, EsCInterno, EsCExterno,
    EsAsesor, EsSupervisor, EsDecano, EsGerente,
]

# Mismo grupo anterior + Soporte, para los catálogos administrados por
# Soporte (GrupoMinciencias, ProductoMinciencias, ProductoXGrupo,
# RolInvestigador, TipoCalificacion, TipoProducto, TipoRubro).
ROLES_LECTURA_CATALOGOS = ROLES_LECTURA_INVESTIGACION_FORMAL + [EsSoporte]

# Roles que pueden ejecutar operaciones de escritura sobre proyectos/objetivos/
# ejecuciones ya en curso (no creación inicial, sino gestión posterior).
ROLES_ESCRITURA_GESTION = [EsCInterno, EsCExterno]

# Roles que pueden crear registros operativos nuevos (proyectos, objetivos,
# investigadores) — Facultad/Grupo son quienes ejecutan directamente el
# proyecto en campo.
ROLES_CREACION_OPERATIVA = [EsFacultad, EsGrupo, EsCInterno, EsCExterno]


def combinar(clases_permiso):
    """Azúcar sintáctico: instancia y combina con | una lista de clases."""
    permiso_combinado = clases_permiso[0]
    for clase in clases_permiso[1:]:
        permiso_combinado = permiso_combinado | clase
    return permiso_combinado()