import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchGroupUsers, borrarPersonaDeGrupo } from "../../features/usuarios/usersSlice.js";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Tabla de personas vinculadas a Grupos/Facultades, con paginación REAL de
 * backend (PersonaXGrupoViewSet.list() siempre pagina).
 *
 * Columnas: las que expone PersonaXGrupoSerializer hoy.
 *   - grupo_nombre en realidad sirve `grupo.sigla_grupo` (no el nombre
 *     completo) y facultad_nombre sirve `facultad.abreviatura` — así están
 *     definidas en el serializer, se respetan esos nombres tal cual.
 *
 * Se removió la columna "Estado" del original: PersonaXGrupoSelector.listar()
 * ya filtra siempre estado=True (ver backend), así que en este listado el
 * valor es constante y no aporta información real. El histórico completo
 * (incluyendo desvinculados) existe en el backend
 * (PersonaXGrupoSelector.listar_historico()) pero no está expuesto todavía
 * por ningún endpoint — pendiente si se necesita una vista de histórico.
 *
 * Se removieron los botones de Borrar/Editar del original: no tenían
 * onClick implementado (no hacían nada). Añadirlos de verdad implica
 * conectar con DELETE /persona-grupo/{id}/ (soft-delete) y con el modal de
 * edición correspondiente — queda para una futura tarea de CRUD, no de
 * paginación.
 *
 * Se removió el cuadro de búsqueda por la misma razón que en
 * PlatformUsersTable: PersonaXGrupoViewSet.list() no soporta ningún
 * parámetro de búsqueda en el backend.
 */
const GroupUsersTable = () => {
  const dispatch = useDispatch();
  const { groupUsers, groupUsersTotal, loading, error, rowLoading } = useSelector(
    (state) => state.usuarios
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const cargarPagina = () => {
    dispatch(fetchGroupUsers({ page: lazyParams.page, pageSize: lazyParams.rows }));
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

  const handleConfirmBorrar = () => {
    if (!filaSeleccionada) return;
    dispatch(borrarPersonaDeGrupo(filaSeleccionada.id)).then((result) => {
      if (borrarPersonaDeGrupo.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        setFilaSeleccionada(null);
        cargarPagina();
      }
    });
  };

  const accionesTemplate = (row) => (
    <Button
      label="Borrar del Grupo"
      icon="pi pi-user-minus"
      className="p-button-danger p-button-sm"
      loading={!!rowLoading[row.id]}
      onClick={() => abrirConfirmacion(row)}
    />
  );

  const header = <h5 className="m-0">Personas en Grupos y Facultades</h5>;

  return (
    <>
      {error && <Message severity="error" className="mb-3 w-full" text="No se pudieron cargar las personas vinculadas." />}
      <DataTable
        value={groupUsers}
        header={header}
        loading={loading}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={groupUsersTotal}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron personas."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="persona_nombre" header="Nombre" />
        <Column field="persona_documento" header="Documento" />
        <Column field="rol_grupo_nombre" header="Cargo" />
        <Column field="grupo_nombre" header="Grupo (sigla)" />
        <Column field="facultad_nombre" header="Facultad (abrev.)" />
        <Column field="vinculacion" header="Fecha de Vinculación" />
        <Column header="Acciones" body={accionesTemplate} />
      </DataTable>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => {
          setIsConfirmVisible(false);
          setFilaSeleccionada(null);
        }}
        onConfirm={handleConfirmBorrar}
        header="¿Borrar del grupo/facultad?"
        loading={filaSeleccionada ? !!rowLoading[filaSeleccionada.id] : false}
      >
        {filaSeleccionada && (
          <p className="mb-0">
            Se borrará (desvinculará) a <strong>{filaSeleccionada.persona_nombre}</strong> de{' '}
            {filaSeleccionada.grupo_nombre || filaSeleccionada.facultad_nombre}.
          </p>
        )}
      </ConfirmationModal>
    </>
  );
};

export default GroupUsersTable;