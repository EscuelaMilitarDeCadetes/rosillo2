import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGroupUsers } from '../../features/users/usersSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

const GroupUsersTable = () => {
  const dispatch = useDispatch();
  const { groupUsers, loading } = useSelector((state) => state.users);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    dispatch(fetchGroupUsers());
  }, [dispatch]);

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Personas en Grupos y Facultades</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const statusBodyTemplate = (rowData) => {
    const severity = rowData.estado ? 'success' : 'danger';
    const value = rowData.estado ? 'Activo' : 'Inactivo';
    return <Tag severity={severity} value={value}></Tag>;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="d-flex gap-2">
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" tooltip="Borrar" />
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-button-sm" tooltip="Editar" />
      </div>
    );
  };

  return (
    <DataTable 
      value={groupUsers} 
      header={header}
      loading={loading}
      paginator 
      rows={10} 
      rowsPerPageOptions={[5, 10, 25]}
      globalFilter={globalFilter}
      emptyMessage="No se encontraron personas."
      responsiveLayout="scroll"
    >
      {/* Asumiendo que la API devuelve objetos anidados */}
      <Column field="persona.nombre" header="Nombre" sortable />
      <Column field="persona.apellido" header="Apellido" sortable />
      <Column field="rol_grupo.cargo" header="Cargo" sortable />
      <Column field="grupo.nombre_grupo" header="Grupo de Investigación" sortable />
      <Column field="facultad.nombre_facultad" header="Facultad" sortable />
      <Column field="vinculacion" header="Fecha Vinculación" sortable />
      <Column field="estado" header="Estado" body={statusBodyTemplate} sortable />
      <Column header="Acciones" body={actionBodyTemplate} />
    </DataTable>
  );
};

export default GroupUsersTable;
