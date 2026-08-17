import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Antes: adivinaba los roles requeridos parseando window.location.pathname
 * y comparaba contra nombres tipo 'ROLE_CINTERNOS' (convención Spring
 * Security del Thymeleaf viejo). Los roles reales en Django, definidos en
 * RolPlataforma.nombre_rol, son SIN prefijo "ROLE_" y en singular:
 *   ASESOR, CEXTERNO, CINTERNO, DECANO, ESTUDIANTE, FACULTAD, GERENTE,
 *   GRUPO, JURADO, SOPORTE, SUPERVISOR, TUTOR
 * (ver apps/usuarios/models/rol_plataforma.py y las clases EsAsesor,
 * EsCInterno, etc. en apps/usuarios/permissions/).
 *
 * Ahora: allowedRoles se pasa como prop en la definición de cada <Route>,
 * no se adivina desde la URL. Si allowedRoles no se especifica, la ruta
 * solo exige estar autenticado (igual que antes por defecto).
 *
 * Uso en App.js:
 *   <Route element={<PrivateRoute allowedRoles={['CINTERNO', 'SOPORTE']} />}>
 *     <Route path="/convocatoria/administrar" element={<AdminConvocatoriasPage />} />
 *   </Route>
 */
const PrivateRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, roles } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const tieneAcceso =
    allowedRoles.length === 0 || allowedRoles.some((rol) => roles.includes(rol));

  if (!tieneAcceso) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;