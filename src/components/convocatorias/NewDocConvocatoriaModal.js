import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { createDocConvocatoria } from '../../features/convocatorias/convocatoriasSlice';

const NewDocConvocatoriaModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { adminItems: convocatorias } = useSelector((state) => state.convocatorias);
  const { tiposDocumento } = useSelector((state) => state.metadata);
  const { docsLoading, docsError } = useSelector((state) => state.convocatorias);

  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
  const [selectedTipoDoc, setSelectedTipoDoc] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!visible) {
      setSelectedConvocatoria(null);
      setSelectedTipoDoc(null);
      setFile(null);
    }
  }, [visible]);

  const handleCreate = () => {
    if (selectedConvocatoria && selectedTipoDoc && file) {
      const payload = {
        convocatoria: selectedConvocatoria,
        tipo_documento: selectedTipoDoc,
        documento_file: file,
      };
      dispatch(createDocConvocatoria(payload)).then((result) => {
        if (createDocConvocatoria.fulfilled.match(result)) {
          onHide();
        }
      });
    }
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Registrar" icon="pi pi-check" onClick={handleCreate} loading={docsLoading} />
    </div>
  );

  return (
    <Dialog header="Agregar Documento a Convocatoria" visible={visible} style={{ width: '40vw' }} footer={footer} onHide={onHide}>
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="convocatoria">Convocatoria</label>
          <Dropdown inputId="convocatoria" value={selectedConvocatoria} options={convocatorias} onChange={(e) => setSelectedConvocatoria(e.value)} optionLabel="nombre_convocatoria" optionValue="id" filter placeholder="Seleccione una convocatoria" />
        </div>
        <div className="field mb-3">
          <label htmlFor="tipo_documento">Tipo de Documento</label>
          <Dropdown inputId="tipo_documento" value={selectedTipoDoc} options={tiposDocumento} onChange={(e) => setSelectedTipoDoc(e.value)} optionLabel="nombre_documento" optionValue="id" filter placeholder="Seleccione un tipo" />
        </div>
        <div className="field mb-3">
          <label>Archivo</label>
          <FileUpload name="doc" customUpload uploadHandler={(e) => setFile(e.files[0])} chooseLabel="Seleccionar" mode="basic" auto accept=".pdf,.doc,.docx" />
          {file && <small className="p-text-secondary ms-2">{file.name}</small>}
        </div>
        {docsError && <div className="alert alert-danger mt-3">{docsError}</div>}
      </div>
    </Dialog>
  );
};

export default NewDocConvocatoriaModal;
