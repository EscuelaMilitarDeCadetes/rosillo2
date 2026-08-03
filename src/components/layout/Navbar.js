import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import { Button } from 'primereact/button';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, roles } = useSelector((state) => state.auth);

  // Función auxiliar para verificar si el usuario tiene al menos uno de los roles
  const hasAnyRole = (requiredRoles) => {
    if (!isAuthenticated || !roles) return false;
    return requiredRoles.some(role => roles.includes(role));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login'); // Redirige al login después de cerrar sesión
  };

  return (
    <header>
      {/* Encabezado superior con el banner */}
      <main style={{ height: '10rem', width: '100%' }}>
        <div className="container text-center" style={{ height: '10rem', width: '100%' }}>
          <div className="row" style={{ height: '10rem' }}>
            <div className="col">
              {/* Asegúrate de que 'banner.png' esté en la carpeta 'public/image' */}
              <img style={{ width: '90%' }} src="/image/banner.png" alt="Banner Rosillo" />
            </div>
          </div>
        </div>
      </main>

      {/* Menú de navegación principal */}
      <nav className="navbar navbar-expand-lg navbar-dark text-center" style={{ backgroundColor: '#162749' }}>
        <div className="container-fluid">
          <Link className="navbar-brand border-bottom text-center" style={{ marginLeft: '8px' }} to="/">JOSÉ MARIA ROSILLO</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              <Link className="nav-item nav-link active" to="/">Inicio</Link>

              {/* Enlaces condicionales basados en roles */}
              {isAuthenticated ? (
                <>
                  {hasAnyRole(['ROLE_SOPORTE']) && (
                    <Link className="nav-item nav-link" to="/usuarios">Usuarios</Link>
                  )}
                  <Link className="nav-item nav-link" to="/perfil">Mi perfil</Link>
                  <Link className="nav-item nav-link" to="/ayuda">Ayuda</Link>

                  {/* Menú Externos */}
                  {hasAnyRole(['ROLE_CEXTERNOS']) && (
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

                  {/* Menú Convocatoria */}
                  {hasAnyRole(['ROLE_CINTERNOS']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Convocatoria
                      </a>
                      <ul className="dropdown-menu">
                        {hasAnyRole(['ROLE_CINTERNOS']) && <li><Link className="dropdown-item" to="/convocatoria/administrar">Administrar Convocatoria</Link></li>}
                        <li><Link className="dropdown-item" to="/convocatoria/documentos">Documentos Convocatoria</Link></li>
                      </ul>
                    </li>
                  )}

                  {/* Menú Estadísticas */}
                  {hasAnyRole(['ROLE_CINTERNOS', 'ROLE_CEXTERNOS', 'ROLE_SUPERVISOR']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Estadísticas
                      </a>
                      <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/estadisticas/proyectos-ejecucion">Proyectos en ejecución y finalizados</Link></li>
                        <li><Link className="dropdown-item" to="/estadisticas/produccion-cientifica">Producción científica</Link></li>
                      </ul>
                    </li>
                  )}

                  {/* Menú Seguimiento y Control */}
                  {hasAnyRole(['ROLE_SUPERVISOR']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Seguimiento y Control
                      </a>
                      <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/seguimiento/proyectos">A Proyectos</Link></li>
                      </ul>
                    </li>
                  )}

                  {/* Menú Participaciones */}
                  {hasAnyRole(['ROLE_FACULTADES', 'ROLE_GRUPOS']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Participaciones
                      </a>
                      <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/convocatorias">Convocatorias Abiertas</Link></li>
                        {hasAnyRole(['ROLE_FACULTADES']) && (
                          <li><Link className="dropdown-item" to="/participaciones/proyectos-facultad">Proyectos en curso (Facultad)</Link></li>
                        )}
                        {hasAnyRole(['ROLE_GRUPOS']) && (
                          <li><Link className="dropdown-item" to="/participaciones/proyectos-grupo">Proyectos en curso (Grupo)</Link></li>
                        )}
                      </ul>
                    </li>
                  )}

                  {/* Menú Proyectos */}
                  {hasAnyRole(['ROLE_CINTERNOS', 'ROLE_SUPERVISOR', 'ROLE_FACULTADES', 'ROLE_GRUPOS', 'ROLE_CEXTERNOS']) && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Proyectos
                      </a>
                      <ul className="dropdown-menu">
                        {hasAnyRole(['ROLE_CINTERNOS']) && (
                          <>
                            <li><Link className="dropdown-item" to="/calificar">Proyectos por calificar</Link></li>
                            <li><Link className="dropdown-item" to="/proyectos?estado=aprobado">Proyectos aprobados</Link></li>
                            <li><Link className="dropdown-item" to="/proyectos?estado=rechazado">Proyectos rechazados</Link></li>
                          </>
                        )}
                        {hasAnyRole(['ROLE_CINTERNOS', 'ROLE_CEXTERNOS']) && (
                          <li><Link className="dropdown-item" to="/proyectos">Todos los Proyectos</Link></li>
                        )}
                        {hasAnyRole(['ROLE_SUPERVISOR']) && (
                          <li><Link className="dropdown-item" to="/proyectos?rol=supervisor">Mis Proyectos (Supervisor)</Link></li>
                        )}
                        {hasAnyRole(['ROLE_FACULTADES']) && (
                          <li><Link className="dropdown-item" to="/proyectos?rol=facultad">Proyectos de mi Facultad</Link></li>
                        )}
                        {hasAnyRole(['ROLE_GRUPOS']) && (
                          <li><Link className="dropdown-item" to="/proyectos?rol=grupo">Proyectos de mi Grupo</Link></li>
                        )}
                      </ul>
                    </li>
                  )}

                  {/* Botón de Cerrar Sesión */}
                  <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="p-button-text p-button-sm nav-item nav-link" onClick={handleLogout} />
                </>
              ) : (
                // Enlace de Iniciar Sesión si no está autenticado
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
