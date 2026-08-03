import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCalificacion, updateCalificacion } from '../../features/calificaciones/calificacionSlice';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import { ProgressSpinner } from 'primereact/progressspinner';

const CalificacionForm = () => {
  const { id } = useParams(); // Obtener el ID del proyecto de la URL
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { calificacionActual, loading, error } = useSelector((state) => state.calificaciones);

  const [observacion, setObservacion] = useState('');
  const [aprobado, setAprobado] = useState(false);

  useEffect(() => {
    dispatch(fetchCalificacion(id));
  }, [dispatch, id]);

  useEffect(() => {
    // Cuando la calificación se carga, actualizamos el estado local
    if (calificacionActual) {
      setObservacion(calificacionActual.observacion);
      setAprobado(calificacionActual.aprobado);
    }
  }, [calificacionActual]);

  const handleSave = () => {
    dispatch(updateCalificacion({ calificacionId: id, data: { observacion, aprobado } })).then(() => {
      navigate('/calificar'); // Volver a la lista después de guardar
    });
  };

  const header = <h2>Calificar Proyecto</h2>;

  if (loading) {
    return <div className="container mt-5 text-center"><ProgressSpinner /></div>;
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <Card title={header}>
        <div className="p-fluid formgrid grid">
          <div className="field col-12">
            <label htmlFor="observacion">Observaciones</label>
            <InputTextarea id="observacion" rows={5} cols={30} value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>
          <div className="field col-12">
            <div className="d-flex align-items-center">
              <InputSwitch checked={aprobado} onChange={(e) => setAprobado(e.target.checked)} />
              <label htmlFor="aprobado" className="ms-3">Aprobar Proyecto</label>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-end">
          <Button label="Guardar Calificación" className="p-button-success" onClick={handleSave} />
        </div>
      </Card>
    </div>
  );
};

export default CalificacionForm;
