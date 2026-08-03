import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchConvocatoria, createProyecto } from '../../features/convocatorias/convocatoriasSlice';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { FileUpload } from 'primereact/fileupload';
import { ProgressSpinner } from 'primereact/progressspinner';
import ConfirmationModal from '../components/common/ConfirmationModal';

const UserParticiparConvocatoriaPage = () => {
  const { id } = useParams(); // Obtener el ID de la convocatoria de la URL
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { convocatoriaActual, loading, error } = useSelector((state) => state.convocatorias);

  const [formData, setFormData] = useState({
    titulo: '',
    financiado: false,
    alianza: false,
    docProyecto: null,
    docCarta: null,
    docAlianza: null,
  });
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchConvocatoria(id));
  }, [dispatch, id]);

  const handleInputChange = (e, name) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleFileUpload = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.files[0] }));
  };

  const validateForm = () => {
    if (!formData.titulo || !formData.docProyecto) {
      setValidationError('El título del proyecto y el documento del proyecto son obligatorios.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleShowConfirmation = () => {
    if (validateForm()) {
      setIsConfirmVisible(true);
    }
  };

  const handleConfirmCreate = () => {
    dispatch(createProyecto({ convocatoriaId: id, data: formData })).then((result) => {
      if (createProyecto.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        navigate('/mis-proyectos'); // Redirigir a la lista de proyectos del usuario
      }
    });
  };

  const header = <h2>Participar en Convocatoria: {convocatoriaActual?.nombre_convocatoria}</h2>;

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
            <span className="p-float-label">
              <InputText id="titulo" value={formData.titulo} onChange={(e) => handleInputChange(e, 'titulo')} required />
              <label htmlFor="titulo">Título del Proyecto</label>
            </span>
          </div>
          <div className="field col-12">
            <label htmlFor="docProyecto">Documento del Proyecto</label>
            <FileUpload name="docProyecto" customUpload uploadHandler={(e) => handleFileUpload(e, 'docProyecto')} chooseLabel="Seleccionar Archivo" mode="basic" auto accept=".pdf,.doc,.docx" />
            {formData.docProyecto && <small className="p-text-secondary ms-2">{formData.docProyecto.name}</small>}
          </div>
          <div className="field col-12">
            <label htmlFor="docCarta">Carta de Presentación (Opcional)</label>
            <FileUpload name="docCarta" customUpload uploadHandler={(e) => handleFileUpload(e, 'docCarta')} chooseLabel="Seleccionar Archivo" mode="basic" auto accept=".pdf,.doc,.docx" />
            {formData.docCarta && <small className="p-text-secondary ms-2">{formData.docCarta.name}</small>}
          </div>
          <div className="field col-12">
            <label htmlFor="docAlianza">Documento de Alianza (Opcional)</label>
            <FileUpload name="docAlianza" customUpload uploadHandler={(e) => handleFileUpload(e, 'docAlianza')} chooseLabel="Seleccionar Archivo" mode="basic" auto accept=".pdf,.doc,.docx" />
            {formData.docAlianza && <small className="p-text-secondary ms-2">{formData.docAlianza.name}</small>}
          </div>
        </div>
        {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
        <div className="d-flex justify-content-end mt-4">
          <Button label="Participar" className="p-button-success" onClick={handleShowConfirmation} />
        </div>
      </Card>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmCreate}
        header="Confirmar Participación"
        loading={loading}
      >
        <h6>Resumen de la participación:</h6>
        <ul>
          <li><strong>Título del Proyecto:</strong> {formData.titulo}</li>
          <li><strong>Documento del Proyecto:</strong> {formData.docProyecto?.name || 'N/A'}</li>
          <li><strong>Carta de Presentación:</strong> {formData.docCarta?.name || 'N/A'}</li>
          <li><strong>Documento de Alianza:</strong> {formData.docAlianza?.name || 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </div>
  );
};

export default UserParticiparConvocatoriaPage;
