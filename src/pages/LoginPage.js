import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/auth/authSlice'; // Importa la acción de login
import { useNavigate, Link } from 'react-router-dom'; // Para redireccionar y usar Link

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Redirige a la página de inicio si ya está logueado
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (e) => {
    e.preventDefault(); // Prevenir el envío tradicional del formulario
    if (username && password) {
      dispatch(loginUser({ username, password }));
    }
  };

  return (
    <div className="login-background">
      <div className="bg-white p-5 rounded-5 shadow" style={{ width: '25rem' }}>
        <div className="text-center mb-4">
          <img style={{ width: '50%' }} src="/image/logo_Cuerpo.png" alt="Logo ESMIC" />
        </div>
        <h2 className="text-center fs-1 fw-bold">Inicio de sesión</h2>
        
        <form onSubmit={handleLogin} className="mt-4">
          <div className="p-fluid">
            <div className="p-field mb-3">
              <span className="p-float-label">
                <InputText 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
                <label htmlFor="username">Correo Institucional</label>
              </span>
            </div>
            <div className="p-field mb-4">
              <span className="p-float-label">
                <Password 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  feedback={false} 
                  toggleMask
                  required
                />
                <label htmlFor="password">Contraseña</label>
              </span>
            </div>
          </div>
          
          {error && <div className="alert alert-danger mt-3">{error}</div>}

          <Button 
            type="submit" 
            label="Iniciar sesión" 
            className="w-100 mt-3" 
            loading={loading} 
          />
          
          <div className="text-center mt-3">
            {/* Reemplazamos el <a> por <Link> de react-router-dom */}
            <Link to="/forgot-password">¿Olvidaste la contraseña?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
