import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInvestigatorAssignments } from '../../features/usuarios/usersSlice.js';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const InvestigatorProjectTable = () => {
  const dispatch = useDispatch();
  const { investigatorAssignments, loading } = useSelector((state) => state.usuarios);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    dispatch(fetchInvestigatorAssignments());
  }, [dispatch]);

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Investigadores por Proyecto</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  return (
    <DataTable value={investigatorAssignments} header={header} loading={loading} paginator rows={10} globalFilter={globalFilter} emptyMessage="No se encontraron asignaciones.">
      <Column field="proyecto_details.titulo" header="Proyecto" sortable />
      <Column field="persona_x_grupo_details.persona_details.nombre" header="Nombre Investigador" sortable />
      <Column field="persona_x_grupo_details.persona_details.apellido" header="Apellido Investigador" sortable />
      <Column field="rol_investigador_details.nombre_rol_investigador" header="Rol en Proyecto" sortable />
    </DataTable>
  );
};

export default InvestigatorProjectTable;
