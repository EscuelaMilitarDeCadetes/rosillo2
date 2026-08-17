import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/PrivateRoute';
 
import LandingPage from './pages/LandingPage'; // NUEVO: portada pública
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CalificarProyectosPage from './pages/CalificarProyectosPage';
import CalificarProyectoSeleccionadoPage from './pages/CalificarProyectoSeleccionadoPage';
import UserConvocatoriaPage from './pages/UserConvocatoriaPage';
import UserParticiparConvocatoriaPage from './pages/UserParticiparConvocatoriaPage';
import SegProyectosPage from './pages/SegProyectosPage';
import EstadisticaProyectosEnDesarrolloPage from './pages/EstadisticaProyectosEnDesarrolloPage';
import EstadisticaProyectosXConvocatoriaPage from './pages/EstadisticaProyectosXConvocatoriaPage';
import ProjectsListPage from './pages/ProjectsListPage';
import HelpPage from './pages/HelpPage';
import ProfilePage from './pages/ProfilePage';
import AdminConvocatoriasPage from './domains/formal/pages/AdminConvocatoriasPage';
import AdminInvestigatorPage from './pages/AdminInvestigatorPage';
import AdminBudgetPage from './pages/AdminBudgetPage';
import RegisterInvestigatorPage from './pages/RegisterInvestigatorPage';
import UsersPage from './domains/usuarios/pages/UsersPage';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadSession } from './features/auth/authSlice';
import AllInfoProyectPage from './pages/AllInfoProyectPage';

// NUEVO: home de cada dominio, con rutas ya separadas para cuando el
// dominio "formativa" tenga sus propias páginas además del placeholder.
import FormalHomePage from './domains/formal/pages/FormalHomePage';
import FormativaHomePage from './domains/formativa/pages/FormativaHomePage';

// NUEVO: páginas de error, destino del interceptor de axiosInstance.js
import NotFoundPage from './pages/errors/NotFoundPage';
import ForbiddenPage from './pages/errors/ForbiddenPage';
import ServerErrorPage from './pages/errors/ServerErrorPage';

import RolPlataformaPage from './domains/catalogos/pages/RolPlataformaPage';
import GradoEstudiosPage from './domains/catalogos/pages/GradoEstudiosPage';
import FacultadEscuelaPage from './domains/catalogos/pages/FacultadEscuelaPage';
import GrupoInvestigacionPage from './domains/catalogos/pages/GrupoInvestigacionPage';
import FacultadXGrupoPage from './domains/catalogos/pages/FacultadXGrupoPage';
import RolGrupoPage from './domains/catalogos/pages/RolGrupoPage';
import RolInvestigadorPage from './domains/catalogos/pages/RolInvestigadorPage';
import TipoDocumentoPage from './domains/catalogos/pages/TipoDocumentoPage';
import TipoCalificacionPage from './domains/catalogos/pages/TipoCalificacionPage';
import ProductoMincienciasPage from './domains/catalogos/pages/ProductoMincienciasPage';
import GrupoMincienciasPage from './domains/catalogos/pages/GrupoMincienciasPage';
import TipoProductoPage from './domains/catalogos/pages/TipoProductoPage';
import ProductoXGrupoPage from './domains/catalogos/pages/ProductoXGrupoPage';
import TipoRubroPage from './domains/catalogos/pages/TipoRubroPage';

 
// Componente de ejemplo para una página protegida
const DashboardPage = () => (
  <div className="container text-center mt-5">
    <h2>Dashboard (Ruta Protegida)</h2>
  </div>
);
 
function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<LandingPage />} /> {/* Antes: HomePage */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/ayuda" element={<HelpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />            
 
            {/* Páginas de error: públicas a propósito. axiosInstance.js hace
                window.location.href hacia /forbidden y /error sin importar
                si el token seguía siendo válido, así que no pueden depender
                de PrivateRoute (podrían mandarte de vuelta a /login en un
                loop). "*" atrapa cualquier URL no definida arriba/abajo. */}
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="/error" element={<ServerErrorPage />} />
 
            {/* Rutas protegidas: cualquier autenticado, sin rol específico */}
            <Route element={<PrivateRoute />}>
              {/* Home de cada dominio. La de "formativa" es un placeholder
                  hasta que ese dominio tenga sus propias pantallas. */}
              <Route path="/formal" element={<FormalHomePage />} />
              <Route path="/formativa" element={<FormativaHomePage />} />
 
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/ayuda" element={<HelpPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Calificación de proyectos — CalificacionViewSet.calificar = EsCInterno */}
            <Route element={<PrivateRoute allowedRoles={['CINTERNO']} />}>
              <Route path="/calificar" element={<CalificarProyectosPage />} />
              <Route path="/calificar/:id" element={<CalificarProyectoSeleccionadoPage />} />
            </Route>

            {/* Postulación a convocatorias — ProyectoXConvocatoriaViewSet.create
                y ConvocatoriaViewSet vía ROLES_CREACION_PROYECTO */}
            <Route element={<PrivateRoute allowedRoles={['FACULTAD', 'GRUPO']} />}>
              <Route path="/convocatorias" element={<UserConvocatoriaPage />} />
              <Route path="/participar/:id" element={<UserParticiparConvocatoriaPage />} />
            </Route>

            {/* Seguimiento y control — PuntoControlViewSet permite un grupo más
                amplio de lectura, pero el Navbar original restringía este menú
                solo a Supervisor por diseño; se mantiene esa intención. */}
            <Route element={<PrivateRoute allowedRoles={['SUPERVISOR']} />}>
              <Route path="/seguimiento/proyectos" element={<SegProyectosPage />} />
            </Route>

            {/* Estadísticas — EstadisticasViewSet = ROLES_LECTURA_INVESTIGACION_FORMAL */}
            <Route element={<PrivateRoute allowedRoles={['FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO', 'ASESOR', 'SUPERVISOR', 'DECANO', 'GERENTE']} />}>
              <Route path="/estadisticas/proyectos-ejecucion" element={<EstadisticaProyectosEnDesarrolloPage />} />
              <Route path="/estadisticas/proyectos-convocatoria" element={<EstadisticaProyectosXConvocatoriaPage />} />
            </Route>

            {/* Listado general de proyectos — ProyectoViewSet (list/retrieve) =
                ROLES_LECTURA_INVESTIGACION_FORMAL */}
            <Route element={<PrivateRoute allowedRoles={['FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO', 'ASESOR', 'SUPERVISOR', 'DECANO', 'GERENTE']} />}>
              <Route path="/proyectos" element={<ProjectsListPage />} />
              <Route path="/proyectos/:id" element={<AllInfoProyectPage />} />
            </Route>

            {/* Administrar convocatorias — ConvocatoriaViewSet: crear = EsAsesor,
                cambiar-estado/internas/externas = EsCInterno. La página mezcla
                ambas operaciones, así que se permiten los dos roles. */}
            <Route element={<PrivateRoute allowedRoles={['CINTERNO', 'ASESOR']} />}>
              <Route path="/convocatoria/administrar" element={<AdminConvocatoriasPage />} />
            </Route>

            {/* Usuarios — RolXUsuarioViewSet y las acciones sensibles de
                UsuarioViewSet (activar/desactivar) = EsSoporte */}
            <Route element={<PrivateRoute allowedRoles={['SOPORTE']} />}>
              <Route path="/usuarios" element={<UsersPage />} />
            </Route>

            {/* Catálogos administrables por SOPORTE
              create/update en los 4 ViewSets exigen EsSoporte. */}
            <Route element={<PrivateRoute allowedRoles={['SOPORTE']} />}>
              <Route path="/catalogos/roles-plataforma" element={<RolPlataformaPage />} />
              <Route path="/catalogos/grados" element={<GradoEstudiosPage />} />
              <Route path="/catalogos/facultades" element={<FacultadEscuelaPage />} />
              <Route path="/catalogos/grupos" element={<GrupoInvestigacionPage />} />
              <Route path="/catalogos/facultad-x-grupo" element={<FacultadXGrupoPage />} />
              <Route path="/catalogos/rol-x-grupo" element={<RolGrupoPage />} />
              <Route path="/catalogos/rol-x-investigador" element={<RolInvestigadorPage />} />
              <Route path="/catalogos/tipo-documento" element={<TipoDocumentoPage />} />
              <Route path="/catalogos/tipo-calificacion" element={<TipoCalificacionPage />} />
              <Route path="/catalogos/producto-minciencias" element={<ProductoMincienciasPage />} />
              <Route path="/catalogos/grupo-minciencias" element={<GrupoMincienciasPage />} />
              <Route path="/catalogos/tipo-producto" element={<TipoProductoPage />} />
              <Route path="/catalogos/producto-x-grupo" element={<ProductoXGrupoPage />} />
              <Route path="/catalogos/tipo-rubro" element={<TipoRubroPage />} />
            </Route>

            {/*
              Administración de investigadores y presupuestos — estas 3 rutas
              YA EXISTÍAN en App.js pero no tienen ningún link en el Navbar
              (ni antes ni ahora): solo son alcanzables tecleando la URL a
              mano. Se les asigna el rol acorde a MontoViewSet.get_permissions
              (ROLES_ESCRITURA_GESTION = CInterno|CExterno para operaciones de
              presupuesto) y UsuarioViewSet (acceso amplio) para las de
              investigadores, pero falta decidir si de verdad se van a usar o
              si son código muerto a eliminar.
            */}
            <Route element={<PrivateRoute allowedRoles={['CINTERNO', 'SOPORTE']} />}>
              <Route path="/admin/investigadores" element={<AdminInvestigatorPage />} />
              <Route path="/admin/registrar-investigador" element={<RegisterInvestigatorPage />} />
            </Route>
            
            <Route element={<PrivateRoute allowedRoles={['CINTERNO', 'CEXTERNO']} />}>
              <Route path="/admin/presupuestos" element={<AdminBudgetPage />} />
            </Route>

            {/* Comodín 404: SIEMPRE al final */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
 
export default App;