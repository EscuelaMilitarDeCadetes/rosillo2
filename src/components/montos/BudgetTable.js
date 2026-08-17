import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjectsWithBudgets } from '../../features/proyectos/projectsSlice.js';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const BudgetTable = ({ onEditBudget }) => {
  const dispatch = useDispatch();
  const { projectsWithBudgets, loading } = useSelector((state) => state.projects);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    dispatch(fetchProjectsWithBudgets());
  }, [dispatch]);

  const formatCurrency = (value) => {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  };

  const actionBodyTemplate = (rowData) => (
    <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-button-sm" onClick={() => onEditBudget(rowData)} />
  );

  return (
    <DataTable value={projectsWithBudgets} header={<div className="d-flex justify-content-between"><h5>Gestión de Presupuestos</h5><InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..."/></div>} loading={loading} paginator rows={10} globalFilter={globalFilter} emptyMessage="No se encontraron proyectos con presupuesto.">
      <Column field="proyecto_details.titulo" header="Proyecto" sortable />
      <Column field="solicitado" header="Solicitado" body={(rowData) => formatCurrency(rowData.solicitado)} sortable />
      <Column field="aprobado" header="Aprobado" body={(rowData) => formatCurrency(rowData.aprobado)} sortable />
      <Column field="ejecutado" header="Ejecutado" body={(rowData) => formatCurrency(rowData.ejecutado)} sortable />
      <Column header="Acciones" body={actionBodyTemplate} />
    </DataTable>
  );
};

export default BudgetTable;
