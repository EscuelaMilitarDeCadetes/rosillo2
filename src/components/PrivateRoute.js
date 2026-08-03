// e:\PROYECTO_ROSILLO\django_react\react_rosillo\src\components\PrivateRoute.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const { isAuthenticated, roles } = useSelector((state) => state.auth);
  
  // Obtener los roles requeridos de la ruta actual
  // Esto es una simplificación. En una aplicación real, los roles se definirían
  // en la configuración de la ruta o se pasarían como prop.
  // Por ahora, asumimos que si es una ruta protegida, el usuario debe tener al menos un rol.
  const path = window.location.pathname; // Obtener la ruta actual
  let requiredRoles = [];
  if (path.startsWith('/convocatoria/')) { // Proteger ambas rutas de convocatoria
    requiredRoles = ['ROLE_CINTERNOS'];
  } else if (path.startsWith('/calificar')) {
    requiredRoles = ['ROLE_CINTERNOS'];
  } else if (path.startsWith('/convocatorias') || path.startsWith('/participar')) {
    requiredRoles = ['ROLE_FACULTADES', 'ROLE_GRUPOS'];
  } else if (path.startsWith('/proyectos')) {
    requiredRoles = ['ROLE_CINTERNOS', 'ROLE_SUPERVISOR', 'ROLE_FACULTADES', 'ROLE_GRUPOS', 'ROLE_CEXTERNOS'];
  }


  // Si no está autenticado, redirige a la página de login
  if (!isAuthenticated) return <Navigate to="/login" />;

  // Si hay roles requeridos y el usuario no tiene ninguno, redirige a una página de acceso denegado o inicio
  if (requiredRoles.length > 0 && !requiredRoles.some(role => roles.includes(role))) {
    return <Navigate to="/" />; // O a una página de "Acceso Denegado"
  }

  return <Outlet />;
};

export default PrivateRoute;
