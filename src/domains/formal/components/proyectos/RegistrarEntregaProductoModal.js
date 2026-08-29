// src/domains/formal/components/proyectos/RegistrarEntregaProductoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import {
  registrarEntregaProducto,
} from '../../../../features/proyectos/productosSlice';
import {
  fetchTiposDocumentoProyecto,
} from '../../../../features/proyectos/documentosSlice';

// Registra la entrega de un producto ya asignado al proyecto: adjunta el
// enlace/URL del documento (GET productos-proyecto/{id}/registrar-entrega/
// en el backend guarda "documento" como texto, no como archivo subido) y
// lo marca como entregado.
const RegistrarEntregaProductoModal = ({ visible, onHide, proyectoId, producto }) => {
  const dispatch = useDispatch();
  const { tiposDocumentoProyecto, loading, error } = useSelector((state) => state.documentos);
  const [documento, setDocumento] = useState('');
  const [tipoDocumentoId, setTipoDocumentoId] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      dispatch(fetchTiposDocumentoProyecto());
    } else {
      setDocumento('');
      setTipoDocumentoId(null);
      setValidationError('');
    }
  }, [visible, dispatch]);

  const handleSubmit = () => {
    if (!documento.trim() || !tipoDocumentoId) {
      setValidationError('Debe indicar el enlace del documento y su tipo.');
      return;
    }
    setValidationError('');
    dispatch(
      registrarEntregaProducto({
        productoXProyectoId: producto.id,
        proyectoId,
        documento: documento.trim(),
        tipoDocumentoId,
      })
    ).then((result) => {
      if (registrarEntregaProducto.fulfilled.match(result)) {
        onHide();
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Registrar Entrega" icon="pi pi-check" onClick={handleSubmit} loading={loading} autoFocus />
    </div>
  );

  return (
    <Dialog header="Registrar Entrega de Producto" visible={visible} style={{ width: '40vw' }} footer={renderFooter} onHide={onHide}>
      {producto && (
        <p className="text-muted">
          Producto: <strong>{producto.producto_nombre}</strong> ({producto.categoria})
        </p>
      )}
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="tipoDocumento">Tipo de Documento</label>
          <Dropdown
            inputId="tipoDocumento"
            value={tipoDocumentoId}
            options={tiposDocumentoProyecto}
            onChange={(e) => setTipoDocumentoId(e.value)}
            optionLabel="nombre_documento"
            optionValue="id"
            filter
            placeholder="Seleccione el tipo de documento"
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="documento">Enlace del Documento (Drive, GrupLAC, etc.)</label>
          <InputText id="documento" value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="https://..." />
        </div>
        {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </Dialog>
  );
};

export default RegistrarEntregaProductoModal;