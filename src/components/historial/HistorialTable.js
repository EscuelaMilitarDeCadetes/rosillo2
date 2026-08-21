// src/components/historial/HistorialTable.js
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { fetchHistorial, buscarHistorial } from '../../features/historial/historialSlice';
import { fetchPlatformUsers } from '../../features/usuarios/usersSlice';

const PAGE_SIZE = 10;

const HistorialTable = () => {
  const dispatch = useDispatch();
  const { items, totalRecords, filtrosActivos, loading, error } = useSelector((state) => state.historial);
  const { platformUsers } = useSelector((state) => state.usuarios);
  const { roles } = useSelector((state) => state.auth); // nuevo
  // RolXUsuarioViewSet (endpoint real detrás de fetchPlatformUsers) está
  // restringido a EsSoporte en el backend. SUPERVISOR no puede consultarlo,
  // así que el filtro "Usuario" solo se ofrece (y se carga) para SOPORTE.
  const puedeFiltrarPorUsuario = roles?.includes('SOPORTE');
  const [page, setPage] = useState(1);
  const [texto, setTexto] = useState('');
  const [rango, setRango] = useState(null); // [fechaInicio, fechaFin] | null
  const [usuarioId, setUsuarioId] = useState(null);
  const [soloSistema, setSoloSistema] = useState(false);

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const hayFiltros = texto.trim() || usuarioId || soloSistema || (rango?.length === 2 && rango[0] && rango[1]);

  const ejecutarBusqueda = useCallback((paginaDestino) => {
    if (!hayFiltros) {
      dispatch(fetchHistorial({ page: paginaDestino, pageSize: PAGE_SIZE }));
      return;
    }
    dispatch(
      buscarHistorial({
        page: paginaDestino,
        pageSize: PAGE_SIZE,
        filtros: {
          texto: texto.trim() || undefined,
          usuarioId: usuarioId || undefined,
          soloSistema: soloSistema || undefined,
          fechaInicio: rango?.length === 2 && rango[0] ? formatDate(rango[0]) : undefined,
          fechaFin: rango?.length === 2 && rango[1] ? formatDate(rango[1]) : undefined,
        },
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, texto, usuarioId, soloSistema, rango]);

  useEffect(() => {
    dispatch(fetchHistorial({ page: 1, pageSize: PAGE_SIZE }));
    // Se carga aquí mismo, ya no depende de haber visitado /usuarios antes.
    if (puedeFiltrarPorUsuario) {
      dispatch(fetchPlatformUsers({ pageSize: 200 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeFiltrarPorUsuario]);

  const handleBuscar = () => {
    setPage(1);
    ejecutarBusqueda(1);
  };

  const handleLimpiar = () => {
    setTexto('');
    setRango(null);
    setUsuarioId(null);
    setSoloSistema(false);
    setPage(1);
    dispatch(fetchHistorial({ page: 1, pageSize: PAGE_SIZE }));
  };

  const handlePage = (e) => {
    const nuevaPagina = e.page + 1;
    setPage(nuevaPagina);
    if (filtrosActivos) {
      ejecutarBusqueda(nuevaPagina);
    } else {
      dispatch(fetchHistorial({ page: nuevaPagina, pageSize: PAGE_SIZE }));
    }
  };

  const fechaBodyTemplate = (rowData) => new Date(rowData.fecha_creacion).toLocaleString('es-CO');
  const usuarioBodyTemplate = (rowData) => rowData.usuario_username || 'SISTEMA';
  const objetoBodyTemplate = (rowData) =>
    rowData.objeto_descripcion ? `${rowData.objeto_tipo}: ${rowData.objeto_descripcion}` : '—';

  const header = (
    <div className="d-flex flex-column gap-2">
      <h5 className="m-0">Historial de Acciones del Sistema</h5>
      <div className="d-flex align-items-end gap-3 flex-wrap">
        <div>
          <label className="d-block small">Texto en la acción</label>
          <InputText value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ej: se creó, se desactivó..." />
        </div>

        <div>
          <label className="d-block small">Rango de fechas</label>
          <Calendar value={rango} onChange={(e) => setRango(e.value)} selectionMode="range" readOnlyInput dateFormat="dd/mm/yy" />
        </div>

        {puedeFiltrarPorUsuario && (
          <div>
            <label className="d-block small">Usuario</label>
            <Dropdown
              value={usuarioId}
              options={platformUsers}
              onChange={(e) => setUsuarioId(e.value)}
              optionLabel="usuario_nombre"
              optionValue="usuario"
              filter
              showClear
              placeholder="Todos"
              style={{ minWidth: '14rem' }}
            />
          </div>
        )}

        <div className="d-flex align-items-center gap-2 mb-2">
          <Checkbox inputId="soloSistema" checked={soloSistema} onChange={(e) => setSoloSistema(e.checked)} />
          <label htmlFor="soloSistema" className="small mb-0">Solo acciones del sistema</label>
        </div>

        <Button label="Buscar" icon="pi pi-search" onClick={handleBuscar} loading={loading} />
        {filtrosActivos && (
          <Button label="Quitar filtros" icon="pi pi-times" className="p-button-outlined" onClick={handleLimpiar} />
        )}
      </div>
    </div>
  );


  return (
    <>
      {error && <Message severity="error" className="mb-3 w-full" text={typeof error === 'string' ? error : 'Ocurrió un error.'} />}
      <DataTable
        value={items}
        header={header}
        loading={loading}
        paginator
        lazy
        rows={PAGE_SIZE}
        totalRecords={totalRecords}
        first={(page - 1) * PAGE_SIZE}
        onPage={handlePage}
        emptyMessage="No se encontraron registros de historial."
        responsiveLayout="scroll"
      >
        <Column field="fecha_creacion" header="Fecha" body={fechaBodyTemplate} />
        <Column header="Usuario" body={usuarioBodyTemplate} />
        <Column field="accion" header="Acción" />
        <Column header="Objeto relacionado" body={objetoBodyTemplate} />
      </DataTable>
    </>
  );
};

export default HistorialTable;