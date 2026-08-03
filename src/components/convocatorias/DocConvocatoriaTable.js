import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { fetchDocConvocatorias, deleteDocConvocatoria } from '../../features/convocatorias/convocatoriasSlice';

const DocConvocatoriaTable = () => {
  const dispatch = useDispatch();
  const { docConvocatorias, docsLoading } = useSelector((state) => state.convocatorias);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    dispatch(fetchDocConvocatorias());
  }, [dispatch]);

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Documentos de Convocatorias</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const actionBodyTemplate = (rowData) => {
    const downloadUrl = `http://localhost:8082/api/documentos-convocatoria/${rowData.id}/download/`;
    return (
      <div className="d-flex gap-2">
        <Button icon="pi pi-download" className="p-button-rounded p-button-info p-button-sm" tooltip="Descargar" onClick={() => window.open(downloadUrl, '_blank')} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" tooltip="Borrar" onClick={() => dispatch(deleteDocConvocatoria(rowData.id))} />
      </div>
    );
  };

  return (
    <DataTable
      value={docConvocatorias}
      header={header}
      loading={docsLoading}
      paginator
      rows={10}
      globalFilter={globalFilter}
      emptyMessage="No se encontraron documentos."
      responsiveLayout="scroll"
    >
      <Column field="convocatoria_details.nombre_convocatoria" header="Convocatoria" sortable />
      <Column field="tipo_documento_details.nombre_documento" header="Tipo de Documento" sortable />
      <Column field="documento" header="Nombre del Archivo" sortable />
      <Column header="Acciones" body={actionBodyTemplate} />
    </DataTable>
  );
};

export default DocConvocatoriaTable;
