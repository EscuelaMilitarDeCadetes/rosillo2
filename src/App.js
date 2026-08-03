import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/PrivateRoute'; // Importa el componente de ruta privada
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Importa la nueva página
import ResetPasswordPage from './pages/ResetPasswordPage'; // Importa la nueva página
import CalificarProyectosPage from './pages/CalificarProyectosPage'; // Importa la nueva página
import CalificarProyectoSeleccionadoPage from './pages/CalificarProyectoSeleccionadoPage'; // Importa la nueva página
import UserConvocatoriaPage from './pages/UserConvocatoriaPage'; // Importa la nueva página
import UserParticiparConvocatoriaPage from './pages/UserParticiparConvocatoriaPage'; // Importa la nueva página
import HomePage from './pages/HomePage';
import SegProyectosPage from './pages/SegProyectosPage';
import EstadisticaProyectosEnDesarrolloPage from './pages/EstadisticaProyectosEnDesarrolloPage';
import EstadisticaProyectosXConvocatoriaPage from './pages/EstadisticaProyectosXConvocatoriaPage';
import ProjectsListPage from './pages/ProjectsListPage'; // Importa la nueva página de listado
import HelpPage from './pages/HelpPage'; // Importa la página de Ayuda
import ProfilePage from './pages/ProfilePage'; // Importa la página de Perfil
import AdminConvocatoriasPage from './pages/AdminConvocatoriasPage'; // Importa la nueva página
import AdminInvestigatorPage from './pages/AdminInvestigatorPage';
import AdminBudgetPage from './pages/AdminBudgetPage';
import RegisterInvestigatorPage from './pages/RegisterInvestigatorPage';
import AdminDocConvocatoriaPage from './pages/AdminDocConvocatoriaPage'; // Importa la nueva página
import UsersPage from './pages/UsersPage'; // Importa la página de Usuarios

// Componente de ejemplo para una página protegida
const DashboardPage = () => (
  <div className="container text-center mt-5">
    <h2>Dashboard (Ruta Protegida)</h2>
  </div>
);

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} /> {/* Ruta pública */}
            <Route path="/ayuda" element={<HelpPage />} /> {/* Ruta pública */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* Ruta pública */}
            <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* Ruta pública */}
            
            {/* Rutas protegidas */}
            <Route element={<PrivateRoute />}>
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/calificar" element={<CalificarProyectosPage />} />
              <Route path="/calificar/:id" element={<CalificarProyectoSeleccionadoPage />} />
              <Route path="/convocatorias" element={<UserConvocatoriaPage />} />
              <Route path="/participar/:id" element={<UserParticiparConvocatoriaPage />} />
              <Route path="/seguimiento/proyectos" element={<SegProyectosPage />} />
              <Route path="/estadisticas/proyectos-ejecucion" element={<EstadisticaProyectosEnDesarrolloPage />} />
              <Route path="/estadisticas/proyectos-convocatoria" element={<EstadisticaProyectosXConvocatoriaPage />} />
              <Route path="/proyectos" element={<ProjectsListPage />} />
              <Route path="/convocatoria/administrar" element={<AdminConvocatoriasPage />} />
              <Route path="/convocatoria/documentos" element={<AdminDocConvocatoriaPage />} />
              <Route path="/usuarios" element={<UsersPage />} />
              <Route path="/admin/investigadores" element={<AdminInvestigatorPage />} />
              <Route path="/admin/presupuestos" element={<AdminBudgetPage />} />
              <Route path="/admin/registrar-investigador" element={<RegisterInvestigatorPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Aquí añadirás más rutas protegidas en el futuro */}
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
