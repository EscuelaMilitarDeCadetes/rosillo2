// src/components/PrivateRoute.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const RUTA_CAMBIAR_PASSWORD = '/cambiar-password';

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
  const { isAuthenticated, roles, debeCambiarPassword } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const tieneAcceso =
    allowedRoles.length === 0 || allowedRoles.some((rol) => roles.includes(rol));

  if (!tieneAcceso) {
    return <Navigate to="/forbidden" replace />;
  }

  // Fuerza el cambio de la contraseña temporal (ver PasswordService /
  // Usuario.debe_cambiar_password) antes de permitir cualquier otra
  // pantalla protegida. Se compara contra location.pathname para no
  // generar un loop de redirección dentro de /cambiar-password mismo.
  if (debeCambiarPassword && location.pathname !== RUTA_CAMBIAR_PASSWORD) {
    return <Navigate to={RUTA_CAMBIAR_PASSWORD} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;