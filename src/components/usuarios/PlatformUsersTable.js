import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPlatformUsers, toggleUserStatus } from '../../features/users/usersSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const PlatformUsersTable = () => {
  const dispatch = useDispatch();
  const { platformUsers, loading, rowLoading } = useSelector((state) => state.users);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    dispatch(fetchPlatformUsers());
  }, [dispatch]);

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Usuarios Activos Registrados</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const actionBodyTemplate = (rowData) => {
    const user = rowData.usuario;
    const actionText = user.estado ? 'Desactivar' : 'Activar';
    const buttonClass = user.estado ? 'p-button-danger' : 'p-button-success';
    return (
      <Button 
        label={actionText} 
        className={`p-button-sm ${buttonClass}`} 
        onClick={() => dispatch(toggleUserStatus(user.id))}
        loading={rowLoading[user.id]} // Muestra un spinner en el botón específico
      />
    );
  };

  return (
    <DataTable 
      value={platformUsers} 
      header={header}
      loading={loading}
      paginator 
      rows={10} 
      rowsPerPageOptions={[5, 10, 25]}
      globalFilter={globalFilter}
      emptyMessage="No se encontraron usuarios."
      responsiveLayout="scroll"
    >
      {/* Asumiendo que la API devuelve objetos anidados */}
      <Column field="usuario.persona.grado_details.sigla" header="Grado" sortable />
      <Column field="usuario.persona_details.nombre" header="Nombre" sortable />
      <Column field="usuario.persona_details.apellido" header="Apellido" sortable />
      <Column field="usuario.persona_details.documento" header="Documento" />
      <Column field="usuario.username" header="Correo" sortable />
      <Column field="rol.nombre_rol" header="Rol en Plataforma" sortable />
      <Column header="Acciones" body={actionBodyTemplate} />
    </DataTable>
  );
};

export default PlatformUsersTable;
