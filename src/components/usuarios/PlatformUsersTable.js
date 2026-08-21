// src/components/usuarios/PlatformUsersTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { fetchPlatformUsers, toggleUserStatus } from '../../features/usuarios/usersSlice';
import ConfirmationModal from '../common/ConfirmationModal';

/**
 * Tabla de usuarios de plataforma con paginación REAL de backend.
 *
 * Columnas: RolXUsuarioSerializer sí expone también los datos de la
 * Persona asociada (persona_grado, persona_nombre, persona_apellido,
 * persona_documento, persona_celular, persona_correo), confirmado en el
 * backend (apps/usuarios/serializers/rol_x_usuario_serializer.py) — por
 * eso se muestran junto a usuario_nombre/rol_nombre/estado, igual que en
 * la tabla "Usuarios Activos registrados" del usuarios.html original.
 *
 * El botón Activar/Desactivar SÍ aplica aquí (usuario_is_active también
 * viene del serializer) y se mantiene en accionesTemplate más abajo.
 *
 * Se removió el cuadro de búsqueda: el endpoint no soporta ningún parámetro
 * de búsqueda (ver list() en el backend), así que un filtro de texto solo
 * podría operar sobre la página cargada (10-50 filas), lo cual es más
 * confuso que útil como "buscador". Si se necesita búsqueda real sobre
 * todo el dataset, hay que agregar soporte de `search` en el backend primero.
 */


const PlatformUsersTable = () => {
  const dispatch = useDispatch();
  // Corregido: el store registra este slice bajo la clave 'usuarios'
  // (ver app/store.js -> usuarios: usersReducer), no 'users'.
  const { platformUsers, platformUsersTotal, loading, error, rowLoading } = useSelector(
    (state) => state.usuarios
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const cargarPagina = () => {
    dispatch(fetchPlatformUsers({ page: lazyParams.page, pageSize: lazyParams.rows }));
  };

  useEffect(() => {
    cargarPagina();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const abrirConfirmacion = (row) => {
    setFilaSeleccionada(row);
    setIsConfirmVisible(true);
  };

  const handleConfirmToggle = () => {
    if (!filaSeleccionada) return;
    const { usuario_id: usuarioId, usuario_is_active: activarActual } = filaSeleccionada;
    dispatch(toggleUserStatus({ userId: usuarioId, activar: !activarActual })).then((result) => {
      if (toggleUserStatus.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        setFilaSeleccionada(null);
        cargarPagina(); // refresca la página actual para reflejar el nuevo estado
      }
    });
  };

  const accionesTemplate = (row) => (
    <Button
      label={row.usuario_is_active ? 'Desactivar' : 'Activar'}
      icon={row.usuario_is_active ? 'pi pi-ban' : 'pi pi-check'}
      className={row.usuario_is_active ? 'p-button-danger p-button-sm' : 'p-button-success p-button-sm'}
      loading={!!rowLoading[row.usuario_id]}
      onClick={() => abrirConfirmacion(row)}
    />
  );

  const header = <h5 className="m-0">Usuarios Activos registrados</h5>;

  return (
    <>
      {error && (
        <Message severity="error" className="mb-3 w-full" text="No se pudieron cargar los usuarios de plataforma." />
      )}
      <DataTable
        value={platformUsers}
        header={header}
        loading={loading}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={platformUsersTotal}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron usuarios."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="persona_grado" header="Grado" />
        <Column field="persona_nombre" header="Nombre" />
        <Column field="persona_apellido" header="Apellido" />
        <Column field="persona_documento" header="Documento" />
        <Column field="persona_celular" header="Celular" />
        <Column field="persona_correo" header="Correo Institucional" />
        <Column field="rol_nombre" header="Rol en la plataforma" />
        <Column header="Acciones" body={accionesTemplate} />
      </DataTable>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => {
          setIsConfirmVisible(false);
          setFilaSeleccionada(null);
        }}
        onConfirm={handleConfirmToggle}
        header={filaSeleccionada?.usuario_is_active ? '¿Desactivar usuario?' : '¿Activar usuario?'}
        loading={filaSeleccionada ? !!rowLoading[filaSeleccionada.usuario_id] : false}
      >
        {filaSeleccionada && (
          <p className="mb-0">
            {filaSeleccionada.usuario_is_active ? 'Desactivar' : 'Activar'} el acceso de{' '}
            <strong>
              {filaSeleccionada.persona_nombre} {filaSeleccionada.persona_apellido}
            </strong>{' '}
            ({filaSeleccionada.usuario_nombre}).
          </p>
        )}
      </ConfirmationModal>
    </>
  );
};

export default PlatformUsersTable;