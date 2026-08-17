/*
 * Tipos de usuario que el rol EsSoporte puede crear.
 * Fuente de verdad: apps/integracion/views/vinculacion_viewset.py
 * (comentario de la clase VinculacionViewSet) + apps/integracion/urls.py:
 *   SOPORTE puede ejecutar: crear-soporte, crear-decano, crear-facultad,
 *   crear-grupo, crear-cinterno, crear-cexterno, crear-asesor,
 *   crear-supervisor, crear-gerente.
 * (crear-estudiante, crear-jurado y crear-tutor están restringidos a
 * EsFacultad -> quedan fuera de este modal a propósito, son parte de la
 * futura pantalla equivalente para el rol Facultad, no de EsSoporte.)
 * Cada tipo define:
 *  - endpoint: sufijo real bajo /api/integracion/crear-<endpoint>/
 *  - flujo: determina qué campos adicionales pide
 *      'administrativo' -> solo datos de Persona + rol de plataforma
 *      'facultad'        -> + facultad_id + rol_grupo_id
 *      'grupo'           -> + grupo_id + rol_grupo_id
 *  - rolCandidatos: posibles valores de RolPlataforma.nombre_rol en la BD
 *    para resolver automáticamente rol_plataforma_id (ver resolverRolPlataforma).
 *    El seed antiguo (INSERT_BEFORE_START) usaba nombres con prefijo
 *    "ROLE_" y en plural (p. ej. 'ROLE_SOPORTE', 'ROLE_CINTERNOS'), pero un
 *    comentario en PrivateRoute.js confirma que los nombres reales ya
 *    migrados son SIN prefijo y en singular: ASESOR, CEXTERNO, CINTERNO,
 *    DECANO, ESTUDIANTE, FACULTAD, GERENTE, GRUPO, JURADO, SOPORTE,
 *    SUPERVISOR, TUTOR. Se listan ambas variantes, con la confirmada primero,
 *    por si el entorno todavía tiene datos del seed viejo en algún punto
 *    intermedio de la migración.
 */
export const TIPOS_USUARIO_SOPORTE = [
  {
    key: 'soporte',
    endpoint: 'crear-soporte',
    label: 'Soporte',
    flujo: 'administrativo',
    rolCandidatos: ['SOPORTE', 'ROLE_SOPORTE'],
  },
  {
    key: 'supervisor',
    endpoint: 'crear-supervisor',
    label: 'Supervisor',
    flujo: 'administrativo',
    rolCandidatos: ['SUPERVISOR', 'ROLE_SUPERVISOR'],
  },
  {
    key: 'gerente',
    endpoint: 'crear-gerente',
    label: 'Gerente',
    flujo: 'administrativo',
    rolCandidatos: ['GERENTE', 'ROLE_GERENTE', 'ROLE_GERENTES'],
  },
  {
    key: 'decano',
    endpoint: 'crear-decano',
    label: 'Decano',
    flujo: 'facultad',
    rolCandidatos: ['DECANO', 'ROLE_DECANOS', 'ROLE_DECANO'],
  },
  {
    key: 'facultad',
    endpoint: 'crear-facultad',
    label: 'Facultad',
    flujo: 'facultad',
    rolCandidatos: ['FACULTAD', 'ROLE_FACULTADES', 'ROLE_FACULTAD'],
  },
  {
    key: 'grupo',
    endpoint: 'crear-grupo',
    label: 'Grupo de investigación',
    flujo: 'grupo',
    rolCandidatos: ['GRUPO', 'ROLE_GRUPOS', 'ROLE_GRUPO'],
  },
  {
    key: 'cinterno',
    endpoint: 'crear-cinterno',
    label: 'Investigador interno (CInterno)',
    flujo: 'grupo',
    rolCandidatos: ['CINTERNO', 'ROLE_CINTERNOS', 'ROLE_CINTERNO'],
  },
  {
    key: 'cexterno',
    endpoint: 'crear-cexterno',
    label: 'Investigador externo (CExterno)',
    flujo: 'grupo',
    rolCandidatos: ['CEXTERNO', 'ROLE_CEXTERNOS', 'ROLE_CEXTERNO'],
  },
  {
    key: 'asesor',
    endpoint: 'crear-asesor',
    label: 'Asesor',
    flujo: 'grupo',
    rolCandidatos: ['ASESOR', 'ROLE_ASESORES', 'ROLE_ASESOR'],
  },
];

/**
 * Busca en la lista de RolPlataforma (metadata.roles) el registro cuyo
 * nombre_rol coincide con alguno de los candidatos del tipo seleccionado.
 * Primero intenta coincidencia exacta (case-insensitive); si no encuentra
 * nada, cae a una coincidencia parcial (includes) usando el 'key' del tipo,
 * por si el rol en BD tiene una variante de nombre no prevista arriba.
 *
 * Devuelve el objeto RolPlataforma completo o `null` si no hay match, para
 * que la UI pueda avisar en vez de enviar un rol_plataforma_id incorrecto.
 */
export function resolverRolPlataforma(roles, tipo) {
  if (!roles?.length || !tipo) return null;

  const porCandidatoExacto = roles.find((r) =>
    tipo.rolCandidatos.some(
      (candidato) => candidato.toLowerCase() === r.nombre_rol?.toLowerCase()
    )
  );
  if (porCandidatoExacto) return porCandidatoExacto;

  const porCoincidenciaParcial = roles.find((r) =>
    r.nombre_rol?.toLowerCase().includes(tipo.key.toLowerCase())
  );
  return porCoincidenciaParcial ?? null;
}