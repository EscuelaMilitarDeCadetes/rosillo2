import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

// Textos y ruta de destino por sistema. 'formal' es el valor por defecto
// para no romper enlaces viejos a "/login" sin query param.
const SISTEMAS = {
  formal: { label: 'Investigación Formal', home: '/formal' },
  formativa: { label: 'Investigación Formativa', home: '/formativa' },
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();

  const sistemaParam = searchParams.get('sistema');
  const sistema = SISTEMAS[sistemaParam] ? sistemaParam : 'formal';

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Redirige al home del sistema elegido (no siempre a "/") una vez autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate(SISTEMAS[sistema].home);
    }
  }, [isAuthenticated, navigate, sistema]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      dispatch(loginUser({ username, password, sistema }));
    }
  };

  return (
    <div className="login-background">
      <div className="bg-white p-5 rounded-5 shadow" style={{ width: '25rem' }}>
        <div className="text-center mb-4">
          <img style={{ width: '50%' }} src="/image/logo_Cuerpo.png" alt="Logo ESMIC" />
        </div>
        <h2 className="text-center fs-1 fw-bold">Inicio de sesión</h2>
        <p className="text-center text-muted mb-0">{SISTEMAS[sistema].label}</p>

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
            <Link to="/forgot-password">¿Olvidaste la contraseña?</Link>
          </div>
          <div className="text-center mt-2">
            <Link to="/">&larr; Volver al inicio</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;