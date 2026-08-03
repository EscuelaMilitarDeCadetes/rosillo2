import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { createInvestigadorCompleto } from '../../features/proyectos/projectsSlice'; // Necesitas crear esta acción
import ConfirmationModal from '../common/ConfirmationModal';

const RegisterInvestigatorModal = ({ visible, onHide, proyectoId }) => {
  const dispatch = useDispatch();
  const { grados, grupos, rolesGrupo, rolesInvestigador } = useSelector((state) => state.metadata);
  const { loading, error } = useSelector((state) => state.proyectos);

  const [formData, setFormData] = useState({});
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setFormData({});
      setValidationError('');
    }
  }, [visible]);

  const handleInputChange = (e, name) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const validateForm = () => {
    // Implementar validación completa aquí
    if (!formData.nombre || !formData.apellido || !formData.documento || !formData.correo || !formData.grado || !formData.grupo || !formData.rolGrupo || !formData.rolInvestigador) {
      setValidationError('Todos los campos obligatorios deben ser llenados.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleShowConfirmation = () => {
    if (validateForm()) {
      onHide();
      setIsConfirmVisible(true);
    }
  };

  const handleConfirmRegister = () => {
    const payload = {
      proyecto: proyectoId,
      ...formData,
      vinculacion: formData.vinculacion ? formData.vinculacion.toISOString().split('T')[0] : null,
    };
    dispatch(createInvestigadorCompleto(payload)).then((result) => {
      if (createInvestigadorCompleto.fulfilled.match(result)) {
        setIsConfirmVisible(false);
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Registrar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <>
      <Dialog header="Registrar Nuevo Investigador Completo" visible={visible} style={{ width: '60vw' }} footer={renderFooter} onHide={onHide}>
        <div className="p-fluid formgrid grid">
          <div className="field col-12 md:col-6">
            <span className="p-float-label">
              <Dropdown inputId="grado" value={formData.grado} options={grados} onChange={(e) => handleInputChange(e, 'grado')} optionLabel="descripcion" optionValue="id" filter placeholder="Seleccione un Grado" />
              <label htmlFor="grado">Grado</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <InputText id="nombre" name="nombre" value={formData.nombre || ''} onChange={(e) => handleInputChange(e, 'nombre')} />
              <label htmlFor="nombre">Nombre</label>
            </span>
          </div>
          {/* ... otros campos de persona ... */}
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <Dropdown inputId="grupo" value={formData.grupo} options={grupos} onChange={(e) => handleInputChange(e, 'grupo')} optionLabel="nombre_grupo" optionValue="id" filter placeholder="Seleccione un Grupo" />
              <label htmlFor="grupo">Grupo de Investigación</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <Dropdown inputId="rolGrupo" value={formData.rolGrupo} options={rolesGrupo} onChange={(e) => handleInputChange(e, 'rolGrupo')} optionLabel="cargo" optionValue="id" filter placeholder="Seleccione Rol en Equipo" />
              <label htmlFor="rolGrupo">Rol en el Equipo</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <Dropdown inputId="rolInvestigador" value={formData.rolInvestigador} options={rolesInvestigador} onChange={(e) => handleInputChange(e, 'rolInvestigador')} optionLabel="nombre_rol_investigador" optionValue="id" filter placeholder="Seleccione Rol en Investigación" />
              <label htmlFor="rolInvestigador">Rol en la Investigación</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <Calendar inputId="vinculacion" value={formData.vinculacion} onChange={(e) => handleInputChange(e, 'vinculacion')} dateFormat="yy-mm-dd" />
              <label htmlFor="vinculacion">Fecha de Vinculación</label>
            </span>
          </div>
        </div>
        {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </Dialog>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmRegister}
        header="Confirmar Registro de Investigador"
        loading={loading}
      >
        <h6>Resumen de datos del nuevo investigador:</h6>
        {/* ... resumen de los datos ... */}
      </ConfirmationModal>
    </>
  );
};

export default RegisterInvestigatorModal;
