import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { addDocumentoProyecto } from '../../features/proyectos/projectsSlice';
import ConfirmationModal from '../common/ConfirmationModal';

const AddDocumentoProyectoModal = ({ visible, onHide, proyectoId }) => {
  const dispatch = useDispatch();
  const { tiposDocumento } = useSelector((state) => state.metadata);
  const { loading, error } = useSelector((state) => state.proyectos);

  const [selectedTipoDoc, setSelectedTipoDoc] = useState(null);
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedTipoDoc(null);
      setFile(null);
      setValidationError('');
    }
  }, [visible]);

  const validateForm = () => {
    if (!selectedTipoDoc || !file) {
      setValidationError('Debe seleccionar un tipo de documento y un archivo.');
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

  const handleConfirmAdd = () => {
    const payload = {
      proyectoId,
      data: {
        tipo_documento: selectedTipoDoc,
        documento_file: file,
      },
    };
    dispatch(addDocumentoProyecto(payload)).then((result) => {
      if (addDocumentoProyecto.fulfilled.match(result)) {
        setIsConfirmVisible(false);
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <>
      <Dialog header="Agregar Documento al Proyecto" visible={visible} style={{ width: '40vw' }} footer={renderFooter} onHide={onHide}>
        <div className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="tipo_documento">Tipo de Documento</label>
            <Dropdown inputId="tipo_documento" value={selectedTipoDoc} options={tiposDocumento} onChange={(e) => setSelectedTipoDoc(e.value)} optionLabel="nombre_documento" optionValue="id" filter placeholder="Seleccione un tipo" />
          </div>
          <div className="field mb-3">
            <label>Archivo</label>
            <FileUpload name="doc" customUpload uploadHandler={(e) => setFile(e.files[0])} chooseLabel="Seleccionar" mode="basic" auto accept=".pdf,.doc,.docx" maxFileSize={10000000} />
            {file && <small className="p-text-secondary ms-2">{file.name}</small>}
          </div>
          {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </Dialog>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmAdd}
        header="Confirmar Adición de Documento"
        loading={loading}
      >
        <h6>Resumen del documento a agregar:</h6>
        <ul>
          <li><strong>Tipo:</strong> {tiposDocumento.find(td => td.id === selectedTipoDoc)?.nombre_documento || 'N/A'}</li>
          <li><strong>Archivo:</strong> {file?.name || 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default AddDocumentoProyectoModal;
