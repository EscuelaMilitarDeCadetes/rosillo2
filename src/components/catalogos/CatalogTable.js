import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { fetchCatalogo } from '../../features/catalogos/catalogosSlice';

/**
 * Tabla genérica con paginación real de backend para cualquier catálogo
 * definido en catalogosConfig.js. Sigue el mismo patrón `lazy` de PrimeReact
 * que PlatformUsersTable.js / GroupUsersTable.js: cada cambio de página
 * dispara fetchCatalogo({catalogKey, page, pageSize}).
 */
const CatalogTable = ({ config, onEdit }) => {
  const dispatch = useDispatch();
  const { items, total, loading, error } = useSelector((state) => state.catalogos[config.key]);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const boolTemplate = (rowData, campo) => (rowData[campo.name] ? 'Sí' : 'No');

  useEffect(() => {
    dispatch(fetchCatalogo({ catalogKey: config.key, page: lazyParams.page, pageSize: lazyParams.rows }));
  }, [dispatch, config.key, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const accionesTemplate = (rowData) => (
    <Button
      icon="pi pi-pencil"
      className="p-button-rounded p-button-text p-button-warning"
      onClick={() => onEdit(rowData)}      
      tooltip="Editar"
    />
  );

  return (
    <>
      {error && <Message severity="error" className="mb-3 w-full" text={error} />}
      <DataTable
        value={items}
        header={<h5 className="m-0">{config.titulo}</h5>}
        loading={loading}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron registros."
        responsiveLayout="scroll"
        dataKey="id"
      >
        {config.campos.map((campo) => (
        <Column
          key={campo.name}
          field={campo.columnField || campo.name}
          header={campo.label}
          body={campo.type === 'checkbox' ? (rowData) => boolTemplate(rowData, campo) : undefined}
        />
        ))}
        <Column body={accionesTemplate} header="Acciones" style={{ width: '5rem' }} />
      </DataTable>
    </>
  );
};

export default CatalogTable;