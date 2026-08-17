import { useSelector } from 'react-redux';

/**
 * Espejo, en el frontend, de las clases EsAsesor/EsCInterno/EsSupervisor/...
 * (apps/usuarios/permissions/) del backend. No reemplaza la validación del
 * backend (que sigue siendo la autoridad real) — solo evita mostrar botones
 * o secciones de menú que el usuario no podría usar de todas formas.
 *
 * Uso:
 *   const esSupervisor = useHasRole('SUPERVISOR');
 *   const esCInternoOSoporte = useHasRole(['CINTERNO', 'SOPORTE']);
 */
export default function useHasRole(rolOrRoles) {
  const roles = useSelector((state) => state.auth.roles);
  const requeridos = Array.isArray(rolOrRoles) ? rolOrRoles : [rolOrRoles];
  return requeridos.some((rol) => roles.includes(rol));
}