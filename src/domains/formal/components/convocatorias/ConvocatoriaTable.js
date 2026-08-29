// src/domains/formal/components/convocatorias/ConvocatoriaTable.js
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import { Toast } from 'primereact/toast';
import { fetchAllConvocatorias, descargarDocumentoConvocatoria } from '../../features/convocatorias/convocatoriasSlice';

const ConvocatoriaTable = ({ onViewProjects }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminItems: convocatorias, adminLoading, adminTotalRecords, adminRows } = useSelector((state) => state.convocatorias);
  const { roles } = useSelector((state) => state.auth);
  const [globalFilter, setGlobalFilter] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [first, setFirst] = useState(0);
  const toast = useRef(null);

  useEffect(() => {
    dispatch(fetchAllConvocatorias({ page: 1, rows: adminRows }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const onPage = (event) => {
    setFirst(event.first);
    dispatch(fetchAllConvocatorias({ page: event.page + 1, rows: event.rows }));
  };

  const handleDownload = (rowData) => {
    setDownloadingId(rowData.id);
    dispatch(descargarDocumentoConvocatoria(rowData.id))
      .then((result) => {
        if (!descargarDocumentoConvocatoria.fulfilled.match(result)) {
          toast.current?.show({ severity: 'error', summary: 'No se pudo descargar', detail: result.payload, life: 6000 });
        }
      })
      .finally(() => setDownloadingId(null));
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Administración de Convocatorias</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar en esta página..." />
      </span>
    </div>
  );

  const statusBodyTemplate = (rowData) => {
    const severity = rowData.estado ? 'success' : 'danger';
    const value = rowData.estado ? 'Activa' : 'Inactiva';
    return <Tag severity={severity} value={value}></Tag>;
  };

  const nombreBodyTemplate = (rowData) => (
    <>
      <Tooltip
        target={`.conv-nombre-${rowData.id}`}
        content="Click aquí para ver los proyectos que se registraron en esta convocatoria"
        position="top"
      />
      <span
        className={`conv-nombre-${rowData.id}`}
        style={{ cursor: 'pointer', color: 'black', textDecoration: 'none' }}
        onClick={() => onViewProjects(rowData)}
      >
        {rowData.nombre_convocatoria}
      </span>
    </>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="d-flex gap-2">
      <Button
        icon="pi pi-download"
        className="p-button-rounded p-button-secondary p-button-sm"
        tooltip="Descargar documento"
        loading={downloadingId === rowData.id}
        onClick={() => handleDownload(rowData)}
      />
      <Button icon="pi pi-plus" className="p-button-rounded p-button-success p-button-sm" tooltip="Participar" onClick={() => navigate(`/participar/${rowData.id}`)} />
    </div>
  );


  return (
    <>
      <Toast ref={toast} />
      <DataTable
        value={convocatorias}
        header={header}
        loading={adminLoading}
        lazy
        paginator
        first={first}
        rows={adminRows}
        totalRecords={adminTotalRecords}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        globalFilter={globalFilter}
        globalFilterFields={['nombre_convocatoria']}
        emptyMessage="No se encontraron convocatorias."
        responsiveLayout="scroll"
      >
        <Column field="nombre_convocatoria" header="Nombre" body={nombreBodyTemplate} sortable />
        <Column field="anio_convocatoria" header="Año" sortable />
        <Column field="inicio" header="Fecha Inicio" sortable />
        <Column field="cierre" header="Fecha Cierre" sortable />
        <Column field="estado" header="Estado" body={statusBodyTemplate} sortable />
        <Column header="Acciones" body={actionBodyTemplate} />
      </DataTable>
    </>
  );
};

export default ConvocatoriaTable;