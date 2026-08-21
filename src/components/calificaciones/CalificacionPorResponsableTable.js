// src/components/calificaciones/CalificacionPorResponsableTable.js
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Link } from 'react-router-dom';
import { fetchProyectosPorResponsable } from '../../features/calificaciones/calificacionResponsableSlice';

const OPCIONES_SI_NO = [
  { label: 'Todas', value: null },
  { label: 'Sí', value: true },
  { label: 'No', value: false },
];

const OPCIONES_CALIFICACION = [
  { label: 'Todos', value: null },
  { label: 'APROBADO', value: 'APROBADO' },
  { label: 'NO_APROBADO', value: 'NO_APROBADO' },
];

const OPCIONES_ESTADO_CALIFICACION = [
  { label: 'Todas', value: null },
  { label: 'En curso', value: false },
  { label: 'Finalizado', value: true },
];

// Componente compartido entre calificarProyectosXFacultad.html y
// calificarProyectosXGrupo.html — son la misma pantalla salvo el rol y el
// alcance (facultad vs. grupo). 'scope' decide cuál se usa.


/**
 * @param {'facultad'|'grupo'} scope
 * @param {string} rolRequerido - 'FACULTAD' | 'GRUPO' (para gatear los botones de acción)
 */
const CalificacionPorResponsableTable = ({ scope, rolRequerido }) => {
  const dispatch = useDispatch();
  const { facultadId, grupoId, roles } = useSelector((state) => state.auth);
  const { resultados, totalRegistros, loading, error } = useSelector(
    (state) => state.calificacionResponsable
  );

  const miInstitucionId = scope === 'facultad' ? facultadId : grupoId;
  const tieneRol = roles?.includes(rolRequerido);

  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [filtroFinanciado, setFiltroFinanciado] = useState(null);
  const [filtroCalificacion, setFiltroCalificacion] = useState(null);
  const [filtroInterno, setFiltroInterno] = useState(null);
  const [filtroEstadoCalificacion, setFiltroEstadoCalificacion] = useState(null);
  const [page, setPage] = useState(1);

  const filtros = useMemo(
    () => ({
      titulo: filtroTitulo || undefined,
      financiado: filtroFinanciado,
      calificacion: filtroCalificacion,
      interno: filtroInterno,
      estado_finalizado_calificacion: filtroEstadoCalificacion,
    }),
    [filtroTitulo, filtroFinanciado, filtroCalificacion, filtroInterno, filtroEstadoCalificacion]
  );

  useEffect(() => {
    if (!miInstitucionId) return;
    const params =
      scope === 'facultad' ? { facultadId: miInstitucionId, filtros, page } : { grupoId: miInstitucionId, filtros, page };
    dispatch(fetchProyectosPorResponsable(params));
  }, [dispatch, scope, miInstitucionId, filtros, page]);

  if (!tieneRol) {
    return null;
  }

  if (!miInstitucionId) {
    return (
      <div className="container mt-4">
        <Message
          severity="warn"
          text={`Tu usuario no tiene ${scope === 'facultad' ? 'una facultad' : 'un grupo'} asignado (PersonaXGrupo activo). Contacta a soporte.`}
        />
      </div>
    );
  }

  const habilitaAcciones = (row) =>
    row.calificacion_ultimo_filtro_calificacion === 'APROBADO' &&
    row.estado_finalizado_calificacion === true &&
    row.proyecto_fecha_inicio &&
    row.proyecto_fecha_inicio !== '2000-01-01';

  const proyectoBodyTemplate = (row) => {
    const noAprobado = row.calificacion_ultimo_filtro_calificacion === 'NO_APROBADO';
    return <span style={{ color: noAprobado ? 'red' : 'black' }}>{row.proyecto_titulo}</span>;
  };

  const valorBodyTemplate = (valor) =>
    valor != null
      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(valor)
      : 'N/A';

  const estadoCalificacionBodyTemplate = (row) => (
    <Tag
      severity={row.estado_finalizado_calificacion ? 'success' : 'warning'}
      value={row.estado_finalizado_calificacion ? 'FINALIZADO' : 'EN PROCESO'}
    />
  );

  const administrarBodyTemplate = (row) => {
    if (!habilitaAcciones(row)) {
      return <strong>Opciones no habilitadas</strong>;
    }
    return (
      <div className="d-flex gap-2 flex-wrap justify-content-center">
        <Link
          className="btn btn-warning btn-sm"
          to={`/investigadores-x-proyecto/${row.proyecto}`}
        >
          CREAR INVESTIGADORES
        </Link>
        <Button
          label="ASIGNAR PRODUCTOS"
          className="p-button-info p-button-sm"
          onClick={() => {
            /* TODO: abrir modal de productos — ver nota de gap producto_x_grupo */
          }}
        />
        <Link className="btn btn-dark btn-sm" to={`/objetivos-x-proyecto/${row.proyecto}`}>
          ASIGNAR OBJETIVOS
        </Link>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h5 className="mb-3">
        Proyectos de {scope === 'facultad' ? 'mi Facultad' : 'mi Grupo'}
      </h5>
      {error && <Message severity="error" text={error} className="w-100 mb-3" />}

      <div className="d-flex flex-wrap gap-2 mb-3">
        <InputText
          value={filtroTitulo}
          onChange={(e) => {
            setPage(1);
            setFiltroTitulo(e.target.value);
          }}
          placeholder="Título del proyecto"
        />
        <Dropdown
          value={filtroFinanciado}
          options={OPCIONES_SI_NO}
          onChange={(e) => {
            setPage(1);
            setFiltroFinanciado(e.value);
          }}
          placeholder="¿Es financiado?"
        />
        <Dropdown
          value={filtroCalificacion}
          options={OPCIONES_CALIFICACION}
          onChange={(e) => {
            setPage(1);
            setFiltroCalificacion(e.value);
          }}
          placeholder="Filtro calificación"
        />
        <Dropdown
          value={filtroInterno}
          options={[
            { label: 'Todas', value: null },
            { label: 'Interna', value: true },
            { label: 'Externa', value: false },
          ]}
          onChange={(e) => {
            setPage(1);
            setFiltroInterno(e.value);
          }}
          placeholder="Tipo de convocatoria"
        />
        <Dropdown
          value={filtroEstadoCalificacion}
          options={OPCIONES_ESTADO_CALIFICACION}
          onChange={(e) => {
            setPage(1);
            setFiltroEstadoCalificacion(e.value);
          }}
          placeholder="Estado"
        />
      </div>

      <DataTable
        value={resultados}
        loading={loading}
        lazy
        paginator
        rows={20}
        totalRecords={totalRegistros}
        first={(page - 1) * 20}
        onPage={(e) => setPage(e.page + 1)}
        emptyMessage="No hay registros disponibles."
        responsiveLayout="scroll"
      >
        <Column field="convocatoria_nombre" header="Convocatoria" />
        <Column header="Proyecto" body={proyectoBodyTemplate} />
        <Column header="Valor Solicitado" body={(r) => valorBodyTemplate(r.monto_solicitado)} />
        <Column header="Valor Aprobado" body={(r) => valorBodyTemplate(r.monto_aprobado)} />
        <Column field="ultimo_filtro_calificacion" header="Última fase calificada" />
        <Column header="Estado de calificación" body={estadoCalificacionBodyTemplate} />
        <Column header="Administrar" body={administrarBodyTemplate} />
      </DataTable>
    </div>
  );
};

export default CalificacionPorResponsableTable;