import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { fetchAllConvocatorias, toggleConvocatoriaStatus } from '../../features/convocatorias/convocatoriasSlice';

const ConvocatoriaTable = ({ onViewProjects, onEditConvocatoria }) => {
  const dispatch = useDispatch();
  const { adminItems: convocatorias, adminLoading, adminError } = useSelector((state) => state.convocatorias);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    dispatch(fetchAllConvocatorias());
  }, [dispatch]);

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Administración de Convocatorias</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const statusBodyTemplate = (rowData) => {
    const severity = rowData.estado ? 'success' : 'danger';
    const value = rowData.estado ? 'Activa' : 'Inactiva';
    return <Tag severity={severity} value={value}></Tag>;
  };

  const actionBodyTemplate = (rowData) => {
    const toggleText = rowData.estado ? 'Desactivar' : 'Activar';
    const toggleClass = rowData.estado ? 'p-button-danger' : 'p-button-success';
    return (
      <div className="d-flex gap-2">
        <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-sm" tooltip="Ver Proyectos" onClick={() => onViewProjects(rowData)} />
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-button-sm" tooltip="Editar Convocatoria" onClick={() => onEditConvocatoria(rowData)} />
        <Button 
          label={toggleText} 
          className={`p-button-sm ${toggleClass}`} 
          onClick={() => dispatch(toggleConvocatoriaStatus(rowData.id))} 
          // loading={adminLoading} // Podrías tener un loading por fila si quieres
        />
      </div>
    );
  };

  return (
    <DataTable
      value={convocatorias}
      header={header}
      loading={adminLoading}
      paginator
      rows={10}
      rowsPerPageOptions={[5, 10, 25]}
      globalFilter={globalFilter}
      emptyMessage="No se encontraron convocatorias."
      responsiveLayout="scroll"
    >
      <Column field="nombre_convocatoria" header="Nombre" sortable />
      <Column field="anio_convocatoria" header="Año" sortable />
      <Column field="inicio" header="Fecha Inicio" sortable />
      <Column field="cierre" header="Fecha Cierre" sortable />
      <Column field="estado" header="Estado" body={statusBodyTemplate} sortable />
      <Column header="Acciones" body={actionBodyTemplate} />
    </DataTable>
  );
};

export default ConvocatoriaTable;
