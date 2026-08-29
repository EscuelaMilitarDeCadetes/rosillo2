// src/domains/formal/components/convocatorias/ConvocatoriasAbiertasTable.js
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOpenConvocatorias, descargarDocumentoConvocatoria } from '../../features/convocatorias/convocatoriasSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';

const ConvocatoriasAbiertasTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  const { items: convocatorias, loading, error } = useSelector((state) => state.convocatorias);
  const [globalFilter, setGlobalFilter] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    dispatch(fetchOpenConvocatorias());
  }, [dispatch]);

  const handleDownload = (rowData) => {
    setDownloadingId(rowData.id);
    dispatch(descargarDocumentoConvocatoria(rowData.id))
      .then((result) => {
        if (!descargarDocumentoConvocatoria.fulfilled.match(result)) {
          toast.current?.show({
            severity: 'warn',
            summary: 'No se pudo descargar',
            detail: result.payload || 'Esta convocatoria no tiene documento adjunto.',
            life: 5000,
          });
        }
      })
      .finally(() => setDownloadingId(null));
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Convocatorias Abiertas</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const statusBodyTemplate = (rowData) => {
    const severity = rowData.estado ? 'success' : 'danger';
    const value = rowData.estado ? 'Abierta' : 'Cerrada';
    return <Tag severity={severity} value={value}></Tag>;
  };

  const documentoBodyTemplate = (rowData) => (
    <Button
      icon="pi pi-download"
      label="Descargar PDF"
      className="p-button-text p-button-sm"
      loading={downloadingId === rowData.id}
      onClick={() => handleDownload(rowData)}
    />
  );

  const actionBodyTemplate = (rowData) => (
    <div className="d-flex gap-2">
      <Button icon="pi pi-plus" className="p-button-rounded p-button-success p-button-sm" tooltip="Participar" onClick={() => navigate(`/participar/${rowData.id}`)} />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <DataTable
        value={convocatorias}
        header={header}
        loading={loading}
        paginator
        rows={10}
        globalFilter={globalFilter}
        emptyMessage="No hay convocatorias abiertas en este momento."
        responsiveLayout="scroll"
      >
        <Column field="nombre_convocatoria" header="Nombre" sortable />
        <Column field="inicio" header="Fecha Inicio" sortable />
        <Column field="cierre" header="Fecha Cierre" sortable />
        <Column field="estado" header="Estado" body={statusBodyTemplate} sortable />
        <Column header="Documento" body={documentoBodyTemplate} />
        <Column header="Acciones" body={actionBodyTemplate} />
      </DataTable>
    </>
  );
};

export default ConvocatoriasAbiertasTable;
