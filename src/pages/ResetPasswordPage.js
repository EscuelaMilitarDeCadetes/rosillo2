import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPasswordConfirm, resetPasswordStatus } from '../features/auth/authSlice';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, resetPasswordSuccess } = useSelector((state) => state.auth);

  useEffect(() => {
    // Limpiar el estado de éxito al montar el componente
    dispatch(resetPasswordStatus());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }
    if (!token) {
      setMessage('Token de restablecimiento no encontrado.');
      return;
    }
    setMessage('');
    dispatch(resetPasswordConfirm({ token, password }));
  };

  if (resetPasswordSuccess) {
    return (
      <div className="login-background">
        <div className="bg-white p-5 rounded-5 shadow text-center">
          <h2>Contraseña Restablecida</h2>
          <p>Tu contraseña ha sido actualizada exitosamente.</p>
          <Button label="Ir a Iniciar Sesión" onClick={() => navigate('/login')} />
        </div>
      </div>
    );
  }

  return (
    <div className="login-background">
      <div className="bg-white p-5 rounded-5 shadow" style={{ width: '25rem' }}>
        <h2 className="text-center fs-1 fw-bold">Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="p-fluid">
            <div className="p-field mb-3">
              <span className="p-float-label">
                <Password value={password} onChange={(e) => setPassword(e.target.value)} toggleMask />
                <label htmlFor="password">Nueva Contraseña</label>
              </span>
            </div>
            <div className="p-field mb-4">
              <span className="p-float-label">
                <Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} feedback={false} />
                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
              </span>
            </div>
          </div>
          {message && <div className="alert alert-warning">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <Button type="submit" label="Restablecer Contraseña" className="w-100 mt-3" loading={loading} />
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
