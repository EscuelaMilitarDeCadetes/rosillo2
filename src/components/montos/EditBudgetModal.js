import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { updateBudget } from '../../features/proyectos/projectsSlice.js';

const EditBudgetModal = ({ visible, onHide, monto }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.projects);
  const [aprobado, setAprobado] = useState(0);

  useEffect(() => {
    if (monto) {
      setAprobado(monto.aprobado);
    }
  }, [monto]);

  const handleSave = () => {
    dispatch(updateBudget({ montoId: monto.id, data: { aprobado } })).then((result) => {
      if (updateBudget.fulfilled.match(result)) {
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" onClick={handleSave} loading={loading} />
    </div>
  );

  return (
    <Dialog header={`Editar Presupuesto de: ${monto?.proyecto_details?.titulo || ''}`} visible={visible} style={{ width: '30vw' }} footer={footer} onHide={onHide}>
      <div className="field">
        <label htmlFor="aprobado">Monto Aprobado</label>
        <InputNumber id="aprobado" value={aprobado} onValueChange={(e) => setAprobado(e.value)} mode="currency" currency="COP" locale="es-CO" />
      </div>
      {error && <div className="alert alert-danger mt-2">{error}</div>}
    </Dialog>
  );
};

export default EditBudgetModal;
