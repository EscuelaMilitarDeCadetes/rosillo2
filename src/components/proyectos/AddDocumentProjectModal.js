// src/components/proyectos/AddDocumentProjectModal.js

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import {
  addDocumentoProyecto,
  fetchTiposDocumentoProyecto,
} from '../../features/proyectos/projectsSlice';
import ConfirmationModal from '../common/ConfirmationModal';

// CORREGIDO: creaba un DocumentoXProyecto inexistente vía
// 'documentos-x-proyecto/' con campo 'documento_file' arbitrario.
// Ahora crea un DocumentoFirma real vía DocumentoFirmaViewSet.create,
// que exige multipart con 'archivo' (SOLO PDF, según
// DocumentoFirmaValidator.validar_archivo_pdf) + 'tipo_documento' +
// content_type_app_label/content_type_model/object_id.
//
// El dropdown de tipos ya no usa state.metadata.tiposDocumento genérico:
// usa el catálogo real filtrado por grupo='proyecto'
// (TipoDocumentoSelector.listar_por_grupo).


const AddDocumentProjectModal = ({ visible, onHide, proyectoId }) => {
  const dispatch = useDispatch();
  const { tiposDocumentoProyecto, loadingDocumentos, errorDocumentos } = useSelector(
    (state) => state.proyectos
  );
  const [selectedTipoDoc, setSelectedTipoDoc] = useState(null);
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      dispatch(fetchTiposDocumentoProyecto());
    } else {
      setSelectedTipoDoc(null);
      setFile(null);
      setValidationError('');
    }
  }, [visible, dispatch]);

  const validateForm = () => {
    if (!selectedTipoDoc || !file) {
      setValidationError('Debe seleccionar un tipo de documento y un archivo.');
      return false;
    }
    // Réplica de DocumentoFirmaValidator.validar_archivo_pdf: solo PDF.
    if (file.type !== 'application/pdf') {
      setValidationError('Solo se aceptan archivos en formato PDF.');
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
    dispatch(
      addDocumentoProyecto({
        proyectoId,
        tipoDocumentoId: selectedTipoDoc,
        archivo: file,
      })
    ).then((result) => {
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
            <Dropdown
              inputId="tipo_documento"
              value={selectedTipoDoc}
              options={tiposDocumentoProyecto}
              onChange={(e) => setSelectedTipoDoc(e.value)}
              optionLabel="nombre_documento"
              optionValue="id"
              filter
              placeholder="Seleccione un tipo"
            />
          </div>
          <div className="field mb-3">
            <label>Archivo (solo PDF, máx. 15MB)</label>
            <FileUpload
              name="doc"
              customUpload
              uploadHandler={(e) => setFile(e.files[0])}
              chooseLabel="Seleccionar"
              mode="basic"
              auto
              accept=".pdf"
              maxFileSize={15000000}
            />
            {file && <small className="p-text-secondary ms-2">{file.name}</small>}
          </div>
          {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
          {errorDocumentos && <div className="alert alert-danger mt-3">{errorDocumentos}</div>}
        </div>
      </Dialog>
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmAdd}
        header="Confirmar Adición de Documento"
        loading={loadingDocumentos}
      >
        <h6>Resumen del documento a agregar:</h6>
        <ul>
          <li><strong>Tipo:</strong> {tiposDocumentoProyecto.find((td) => td.id === selectedTipoDoc)?.nombre_documento || 'N/A'}</li>
          <li><strong>Archivo:</strong> {file?.name || 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default AddDocumentProjectModal;