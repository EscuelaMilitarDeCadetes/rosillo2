import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProyectosPorUsuario } from '../../features/convocatorias/convocatoriasSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

const ProyectosUsuarioTable = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { proyectosUsuario, proyectosUsuarioLoading, proyectosUsuarioError } = useSelector((state) => state.convocatorias);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    if (user) {
      dispatch(fetchProyectosPorUsuario(user.id));
    }
  }, [dispatch, user]);

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Mis Proyectos</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const statusBodyTemplate = (rowData) => {
    // Adapta esto a tu modelo de datos
    const severity = rowData.estado ? 'success' : 'danger';
    const value = rowData.estado ? 'Activo' : 'Inactivo';
    return <Tag severity={severity} value={value}></Tag>;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="d-flex gap-2">
        <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-sm" tooltip="Ver Detalles" />
      </div>
    );
  };

  return (
    <DataTable
      value={proyectosUsuario}
      header={header}
      loading={proyectosUsuarioLoading}
      paginator
      rows={10}
      globalFilter={globalFilter}
      emptyMessage="No tienes proyectos registrados."
      responsiveLayout="scroll"
    >
      <Column field="proyecto.titulo" header="Título del Proyecto" sortable />
      <Column field="convocatoria.nombre_convocatoria" header="Convocatoria" sortable />
      <Column field="fecha_presentacion" header="Fecha Presentación" sortable />
      <Column field="estado" header="Estado" body={statusBodyTemplate} sortable />
      <Column header="Acciones" body={actionBodyTemplate} />
    </DataTable>
  );
};

export default ProyectosUsuarioTable;
