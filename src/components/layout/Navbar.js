import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import { Button } from 'primereact/button';

// Agregar al bloque de imports de Navbar.js
import { useNotificacionesWebSocket } from '../../hooks/useNotificacionesWebSocket';
import { fetchNotificacionesIniciales } from '../../features/notificaciones/notificacionesSlice';


const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { noLeidas } = useSelector((state) => state.notificaciones);
  const navigate = useNavigate();
  const { isAuthenticated, roles, sistemaActivo } = useSelector((state) => state.auth);  

  // Antes, "Inicio" y la marca siempre apuntaban a "/". Ahora "/" es la
  // portada pública (LandingPage): si el usuario ya inició sesión, debe
  // volver al home de SU dominio (formal o formativa), no a la portada.
  const inicioHref = isAuthenticated ? `/${sistemaActivo || 'formal'}` : '/';

  // Función auxiliar para verificar si el usuario tiene al menos uno de los roles
  const hasAnyRole = (requiredRoles) => {
    if (!isAuthenticated || !roles) return false;
    return requiredRoles.some(role => roles.includes(role));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  useNotificacionesWebSocket(); // abre y mantiene la conexión mientras el Navbar está montado

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotificacionesIniciales(user.id));
    }
  }, [user, dispatch]);

  return (
    <header>
      {/* Encabezado superior con el banner */}
      <main style={{ height: '10rem', width: '100%' }}>
        <div className="container text-center" style={{ height: '10rem', width: '100%' }}>
          <div className="row" style={{ height: '10rem' }}>
            <div className="col">
              <img style={{ width: '90%' }} src="/image/banner.png" alt="Banner Rosillo" />
            </div>
          </div>
        </div>
      </main>
      {/* Menú de navegación principal */}
      <nav className="navbar navbar-expand-lg navbar-dark text-center" style={{ backgroundColor: '#162749' }}>
        <div className="container-fluid">
          <Link className="navbar-brand border-bottom text-center" style={{ marginLeft: '8px' }} to={inicioHref}>JOSÉ MARIA ROSILLO</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              <Link className="nav-item nav-link active" to={inicioHref}>Inicio</Link>
              {isAuthenticated ? (
                <>
                  {/* Usuarios — RolXUsuarioViewSet / acciones sensibles de UsuarioViewSet = EsSoporte */}
                  {hasAnyRole(['SOPORTE']) && (
                    <Link className="nav-item nav-link" to="/usuarios">Usuarios</Link>
                  )}
                  {/* Catálogos — los 14 ViewSets de solo-lectura/escritura EsSoporte
                      migrados del punto 4 (INSERT_BEFORE_START_V33). Algunos exigen
                      además TieneAmbitoFormal para crear/editar; ver avisoPermiso de
                      cada entrada en catalogosConfig.js. */}
                  {hasAnyRole(['SOPORTE']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Catálogos
                      </a>
                      <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/catalogos/roles-plataforma">Roles de Plataforma</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/grados">Grados de Estudio</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/facultades">Facultades / Escuelas</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/grupos">Grupos de Investigación</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/facultad-grupo">Facultades por Grupo</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/roles-grupo">Roles de Grupo</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/roles-investigador">Roles de Investigador</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/tipos-documento">Tipos de Documento</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/tipos-calificacion">Tipos de Calificación</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/productos-minciencias">Productos Minciencias</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/grupos-minciencias">Grupos Minciencias</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/tipos-producto">Tipos de Producto</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/productos-grupo">Productos por Grupo</Link></li>
                        <li><Link className="dropdown-item" to="/catalogos/tipos-rubro">Tipos de Rubro</Link></li>
                      </ul>
                    </li>
                  )}                  
                  <Link className="nav-item nav-link" to="/perfil">Mi perfil</Link>
                  <Link className="nav-item nav-link" to="/ayuda">Ayuda</Link>
 
                  {/* Externos — proyectos externos: ProyectoViewSet.crear_externo = EsCExterno */}
                  {hasAnyRole(['CEXTERNO']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Externos
                      </a>
                      <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/proyectos/crear?tipo=externo">Crear Proyecto Externo</Link></li>
                        <li><Link className="dropdown-item" to="/proyectos?tipo=externo">Administrar Proyectos Externos</Link></li>
                      </ul>
                    </li>
                  )}
 
                  {/* Convocatoria — ConvocatoriaViewSet: internas/externas/cambiar-estado = EsCInterno */}
                  {hasAnyRole(['CINTERNO']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Convocatoria
                      </a>
                      <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/convocatoria/administrar">Administrar Convocatoria</Link></li>
                      </ul>
                    </li>
                  )}
 
                  {/* Estadísticas — EstadisticasViewSet = ROLES_LECTURA_INVESTIGACION_FORMAL (grupo amplio) */}
                  {hasAnyRole(['FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO', 'ASESOR', 'SUPERVISOR', 'DECANO', 'GERENTE']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Estadísticas
                      </a>
                      <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/estadisticas/proyectos-ejecucion">Proyectos en ejecución y finalizados</Link></li>
                        <li><Link className="dropdown-item" to="/estadisticas/proyectos-convocatoria">Producción científica</Link></li>
                      </ul>
                    </li>
                  )}
 
                  {/* Seguimiento y Control — se mantiene solo para Supervisor,
                      por diseño original de este menú (ver App.js) */}
                  {hasAnyRole(['SUPERVISOR']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Seguimiento y Control
                      </a>
                      <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/seguimiento/proyectos">A Proyectos</Link></li>
                      </ul>
                    </li>
                  )}
 
                  {/* Participaciones — ROLES_CREACION_PROYECTO = Facultad, Grupo */}
                  {hasAnyRole(['FACULTAD', 'GRUPO']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Participaciones
                      </a>
                      <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/convocatorias">Convocatorias Abiertas</Link></li>
                        {hasAnyRole(['FACULTAD']) && (
                          <li><Link className="dropdown-item" to="/participaciones/proyectos-facultad">Proyectos en curso (Facultad)</Link></li>
                        )}
                        {hasAnyRole(['GRUPO']) && (
                          <li><Link className="dropdown-item" to="/participaciones/proyectos-grupo">Proyectos en curso (Grupo)</Link></li>
                        )}
                      </ul>
                    </li>
                  )}
 
                  {/* Proyectos — ProyectoViewSet (list/retrieve) = ROLES_LECTURA_INVESTIGACION_FORMAL,
                      con sub-acciones más finas dentro (calificar = CInterno, etc.) */}
                  {hasAnyRole(['CINTERNO', 'SUPERVISOR', 'FACULTAD', 'GRUPO', 'CEXTERNO']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Proyectos
                      </a>
                      <ul className="dropdown-menu">
                        {hasAnyRole(['CINTERNO']) && (
                          <>
                            <li><Link className="dropdown-item" to="/calificar">Proyectos por calificar</Link></li>
                            <li><Link className="dropdown-item" to="/proyectos?estado=aprobado">Proyectos aprobados</Link></li>
                            <li><Link className="dropdown-item" to="/proyectos?estado=rechazado">Proyectos rechazados</Link></li>
                          </>
                        )}
                        {hasAnyRole(['CINTERNO', 'CEXTERNO']) && (
                          <li><Link className="dropdown-item" to="/proyectos">Todos los Proyectos</Link></li>
                        )}
                        {hasAnyRole(['SUPERVISOR']) && (
                          <li><Link className="dropdown-item" to="/proyectos?rol=supervisor">Mis Proyectos (Supervisor)</Link></li>
                        )}
                        {hasAnyRole(['FACULTAD']) && (
                          <li><Link className="dropdown-item" to="/proyectos?rol=facultad">Proyectos de mi Facultad</Link></li>
                        )}
                        {hasAnyRole(['GRUPO']) && (
                          <li><Link className="dropdown-item" to="/proyectos?rol=grupo">Proyectos de mi Grupo</Link></li>
                        )}
                      </ul>
                    </li>
                  )}
 
                  <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="p-button-text p-button-sm nav-item nav-link" onClick={handleLogout} />
                </>
              ) : (
                <Link className="nav-item nav-link" to="/login">Iniciar Sesión</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;