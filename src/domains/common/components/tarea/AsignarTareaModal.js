// src/domains/common/components/tarea/AsignarTareaModal.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';
import { crearTarea, limpiarErrorTarea } from '../../features/tarea/tareaSlice';

const nombreUsuario = (u) => u.persona_actual_nombre || u.username;

// Modal reutilizable de asignación de tareas (CRUD -> create). Se embebe
// desde CUALQUIER pantalla dueña de un objeto (proyecto, tesis, documento,
// etc.) pasando su content type explícito; ese es el mismo patrón genérico
// que ya usa el backend (Tarea.content_type + object_id vía
// GenericForeignKey), así que no hace falta una versión distinta por dominio.
//
// Si no se reciben props de objeto (modo "genérico", ej. desde una pantalla
// administrativa sin contexto fijo), se muestran campos de texto para
// indicarlos manualmente.
const AsignarTareaModal = ({
  visible,
  onHide,
  contentTypeAppLabel,
  contentTypeModel,
  objectId,
  objetoLabel,
}) => {
  const dispatch = useDispatch();
  const { usuarios, loading: cargandoMetadata } = useSelector((state) => state.metadata);
  const { creando, crearError } = useSelector((state) => state.tarea);

  const modoGenerico = !contentTypeAppLabel || !contentTypeModel || !objectId;

  const [asignadoAId, setAsignadoAId] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState(null);
  const [appLabelManual, setAppLabelManual] = useState('');
  const [modelManual, setModelManual] = useState('');
  const [objectIdManual, setObjectIdManual] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible && !usuarios?.length) dispatch(fetchMetadata());
  }, [visible, dispatch, usuarios]);

  useEffect(() => {
    if (visible) {
      dispatch(limpiarErrorTarea());
      setAsignadoAId(null);
      setDescripcion('');
      setFechaLimite(null);
      setAppLabelManual('');
      setModelManual('');
      setObjectIdManual('');
      setValidationError('');
    }
  }, [visible, dispatch]);

  const handleSubmit = () => {
    const appLabel = contentTypeAppLabel || appLabelManual.trim();
    const model = contentTypeModel || modelManual.trim();
    const objId = objectId || objectIdManual.trim();

    if (!asignadoAId || !descripcion.trim() || !appLabel || !model || !objId) {
      setValidationError('Debe completar el responsable, la descripción y el objeto relacionado.');
      return;
    }
    setValidationError('');
    dispatch(
      crearTarea({
        asignadoAId,
        descripcion: descripcion.trim(),
        fechaLimite: fechaLimite ? fechaLimite.toISOString().slice(0, 10) : undefined,
        contentTypeAppLabel: appLabel,
        contentTypeModel: model,
        objectId: objId,
      })
    ).then((result) => {
      if (crearTarea.fulfilled.match(result)) onHide();
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
      <Button label="Asignar Tarea" icon="pi pi-check" loading={creando} onClick={handleSubmit} />
    </div>
  );

  return (
    <Dialog header="Asignar Tarea" visible={visible} style={{ width: '28rem' }} footer={footer} onHide={onHide}>
      {(validationError || crearError) && (
        <Message severity="error" className="mb-3 w-full" text={validationError || crearError} />
      )}

      {objetoLabel && (
        <p className="text-muted small mb-3">
          Objeto relacionado: <strong>{objetoLabel}</strong>
        </p>
      )}

      {modoGenerico && (
        <div className="d-flex gap-2 mb-3">
          <div className="field mb-0 flex-grow-1">
            <label>App</label>
            <InputText value={appLabelManual} onChange={(e) => setAppLabelManual(e.target.value)} placeholder="ej: investigacion_formal" className="w-100" />
          </div>
          <div className="field mb-0 flex-grow-1">
            <label>Modelo</label>
            <InputText value={modelManual} onChange={(e) => setModelManual(e.target.value)} placeholder="ej: proyecto" className="w-100" />
          </div>
          <div className="field mb-0" style={{ width: '6rem' }}>
            <label>ID</label>
            <InputText value={objectIdManual} onChange={(e) => setObjectIdManual(e.target.value)} className="w-100" />
          </div>
        </div>
      )}

      <div className="field mb-3">
        <label htmlFor="asignadoA">Responsable</label>
        <Dropdown
          inputId="asignadoA"
          value={asignadoAId}
          options={usuarios}
          onChange={(e) => setAsignadoAId(e.value)}
          optionLabel={nombreUsuario}
          optionValue="id"
          filter
          placeholder="Seleccione un usuario"
          disabled={cargandoMetadata}
          className="w-100"
        />
      </div>
      <div className="field mb-3">
        <label htmlFor="descripcionTarea">Descripción</label>
        <InputText
          id="descripcionTarea"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={255}
          className="w-100"
        />
      </div>
      <div className="field mb-0">
        <label htmlFor="fechaLimiteTarea">Fecha Límite (opcional)</label>
        <Calendar
          inputId="fechaLimiteTarea"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.value)}
          dateFormat="dd/mm/yy"
          showIcon
          className="w-100"
        />
      </div>
    </Dialog>
  );
};

export default AsignarTareaModal;