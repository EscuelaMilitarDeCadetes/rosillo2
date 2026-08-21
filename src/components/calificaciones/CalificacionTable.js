// src/components/calificaciones/CalificacionTable.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import {
  fetchProyectosSinCalificar,
  fetchProyectosCalificados,
  habilitarCorreccionDocumento,
  deshabilitarCorreccionDocumento,
  fetchDocumentosParticipacion,
  limpiarDocumentosParticipacion,
  descargarDocumentoParticipacion,
} from '../../features/calificaciones/calificacionSlice';

// AUDITORÍA calificarProyectos.html -> CORREGIDO por completo.
// Objetivo real de la pantalla (confirmado contra el Thymeleaf original y
// ProyectoXConvocatoriaViewSet): listar los proyectos postulados a una
// convocatoria para que un evaluador interno (CINTERNO) los califique,
// con filtros, toggle de corrección de documentos y visor de documentos
// de participación. No es una pantalla de perfil.
//
// Fuentes de datos reales:
// - GET  proyecto-convocatoria/sin-calificar/   (pestaña "Pendientes")
// - GET  proyecto-convocatoria/calificados/     (pestaña "Calificados")
// - PATCH proyecto-convocatoria/{id}/habilitar-correccion/ | deshabilitar-correccion/
// - GET  productos-proyecto/por-proyecto/{proyecto_id}/  (modal documentos)
//
// LIMITACIÓN DE BACKEND (no de este componente): sin-calificar/ y
// calificados/ no paginan en el servidor (a diferencia de list()/buscar()
// en el mismo ViewSet), así que la paginación y los filtros de texto se
// resuelven en cliente sobre el array completo.


const OPCIONES_FINANCIADO = [
  { label: 'Todos', value: null },
  { label: 'Financiados', value: true },
  { label: 'No financiados', value: false },
];

const OPCIONES_RESULTADO = [
  { label: 'Todos', value: null },
  { label: 'Aprobados', value: 'APROBADO' },
  { label: 'No aprobados', value: 'NO_APROBADO' },
];

const CalificacionTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);

  const { roles } = useSelector((state) => state.auth);
  const {
    pendientes,
    loadingPendientes,
    calificados,
    loadingCalificados,
    accionLoadingId,
    documentosParticipacion,
    loadingDocumentos,
    descargandoDocumentoId,
  } = useSelector((state) => state.calificaciones);

  const puedeGestionarCorreccion = roles?.includes('CINTERNO');
  const puedeCalificar = roles?.includes('CINTERNO');

  const [tabIndex, setTabIndex] = useState(0);
  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [filtroConvocatoria, setFiltroConvocatoria] = useState('');
  const [filtroResponsable, setFiltroResponsable] = useState('');
  const [filtroFinanciado, setFiltroFinanciado] = useState(null);
  const [filtroResultado, setFiltroResultado] = useState(null);

  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalProyectoTitulo, setDocModalProyectoTitulo] = useState('');
  const [filtroFase, setFiltroFase] = useState('');

  useEffect(() => {
    dispatch(fetchProyectosSinCalificar());
  }, [dispatch]);

  useEffect(() => {
    if (tabIndex === 1) {
      dispatch(fetchProyectosCalificados(filtroResultado));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, tabIndex, filtroResultado]);

  const aplicarFiltrosTexto = (lista) => {
    return lista.filter((item) => {
      const coincideTitulo = filtroTitulo
        ? item.proyecto_titulo?.toLowerCase().includes(filtroTitulo.toLowerCase())
        : true;
      const coincideConvocatoria = filtroConvocatoria
        ? item.convocatoria_nombre?.toLowerCase().includes(filtroConvocatoria.toLowerCase())
        : true;
      const coincideResponsable = filtroResponsable
        ? item.responsable?.toLowerCase().includes(filtroResponsable.toLowerCase())
        : true;
      const coincideFase = filtroFase ? item.ultimo_filtro_calificacion === filtroFase : true;
      const coincideFinanciado =
        filtroFinanciado === null
          ? true
          : filtroFinanciado
            ? item.monto_aprobado !== null
            : item.monto_aprobado === null;
      return coincideTitulo && coincideConvocatoria && coincideResponsable && coincideFase && coincideFinanciado;
    });
  };

  const pendientesFiltrados = useMemo(
    () => aplicarFiltrosTexto(pendientes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendientes, filtroTitulo, filtroConvocatoria, filtroResponsable, filtroFinanciado]
  );

  const calificadosFiltrados = useMemo(
    () => aplicarFiltrosTexto(calificados),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calificados, filtroTitulo, filtroConvocatoria, filtroResponsable, filtroFinanciado]
  );

  const handleVerDocumentos = (rowData) => {
    setDocModalProyectoTitulo(rowData.proyecto_titulo);
    setDocModalVisible(true);
    dispatch(fetchDocumentosParticipacion(rowData.proyecto));
  };

  const handleCerrarDocModal = () => {
    setDocModalVisible(false);
    dispatch(limpiarDocumentosParticipacion());
  };

  const handleToggleCorreccion = (rowData) => {
    const accion = rowData.modificacion_documento_proyecto
      ? deshabilitarCorreccionDocumento
      : habilitarCorreccionDocumento;
    dispatch(accion(rowData.id)).then((result) => {
      if (accion.rejected.match(result)) {
        toast.current?.show({
          severity: 'error',
          summary: 'No se pudo actualizar',
          detail: result.payload || 'Error al cambiar el estado de corrección.',
          life: 5000,
        });
      }
    });
  };

  const montoBodyTemplate = (rowData) =>
    rowData.monto_aprobado != null
      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(
          rowData.monto_aprobado
        )
      : <Tag severity="warning" value="Sin aprobar" />;

  const faseBodyTemplate = (rowData) =>
    rowData.ultimo_filtro_calificacion || <span className="text-muted">Sin iniciar</span>;

  const resultadoBodyTemplate = (rowData) => {
    if (!rowData.calificacion_ultimo_filtro_calificacion) return '-';
    const aprobado = rowData.calificacion_ultimo_filtro_calificacion === 'APROBADO';
    return (
      <Tag
        severity={aprobado ? 'success' : 'danger'}
        value={aprobado ? 'APROBADO' : 'NO APROBADO'}
      />
    );
  };

  const correccionBodyTemplate = (rowData) => (
    <Tag
      severity={rowData.modificacion_documento_proyecto ? 'info' : 'secondary'}
      value={rowData.modificacion_documento_proyecto ? 'Corrección habilitada' : 'Corrección cerrada'}
    />
  );

  const accionesPendientesTemplate = (rowData) => (
    <div className="d-flex gap-2 flex-wrap">
      {puedeCalificar && (
        <Button
          icon="pi pi-check-square"
          className="p-button-rounded p-button-warning p-button-sm"
          tooltip="Calificar proyecto"
          onClick={() => navigate(`/calificar/${rowData.id}`)}
        />
      )}
      {puedeGestionarCorreccion && (
        <Button
          icon={rowData.modificacion_documento_proyecto ? 'pi pi-lock' : 'pi pi-lock-open'}
          className={`p-button-rounded p-button-sm ${
            rowData.modificacion_documento_proyecto ? 'p-button-secondary' : 'p-button-help'
          }`}
          tooltip={
            rowData.modificacion_documento_proyecto
              ? 'Deshabilitar corrección de documentos'
              : 'Habilitar corrección de documentos'
          }
          loading={accionLoadingId === rowData.id}
          onClick={() => handleToggleCorreccion(rowData)}
        />
      )}
      <Button
        icon="pi pi-folder-open"
        className="p-button-rounded p-button-secondary p-button-sm"
        tooltip="Ver documentos de participación"
        onClick={() => handleVerDocumentos(rowData)}
      />
    </div>
  );

  const accionesCalificadosTemplate = (rowData) => (
    <div className="d-flex gap-2 flex-wrap">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-info p-button-sm"
        tooltip="Ver resultados de calificación"
        onClick={() => navigate(`/calificar/${rowData.id}`)}
      />
      <Button
        icon="pi pi-folder-open"
        className="p-button-rounded p-button-secondary p-button-sm"
        tooltip="Ver documentos de participación"
        onClick={() => handleVerDocumentos(rowData)}
      />
    </div>
  );

  // Nuevo: opciones derivadas de los datos ya cargados (mismo criterio que
  // el resto de filtros de este componente: no hay endpoint de fases
  // distintas en el backend, así que se calculan en cliente).
  const opcionesFase = useMemo(() => {
    const valores = new Set(
      [...pendientes, ...calificados]
        .map((item) => item.ultimo_filtro_calificacion)
        .filter(Boolean)
    );
    return [
      { label: 'Todas', value: '' },
      ...Array.from(valores).sort().map((v) => ({ label: v, value: v })),
    ];
  }, [pendientes, calificados]);

  const filtrosHeader = (
    <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={filtroTitulo}
          onChange={(e) => setFiltroTitulo(e.target.value)}
          placeholder="Título del proyecto"
        />
      </span>
      <InputText
        value={filtroConvocatoria}
        onChange={(e) => setFiltroConvocatoria(e.target.value)}
        placeholder="Convocatoria"
      />
      <InputText
        value={filtroResponsable}
        onChange={(e) => setFiltroResponsable(e.target.value)}
        placeholder="Responsable (facultad/grupo)"
      />
      <Dropdown
        value={filtroFinanciado}
        options={OPCIONES_FINANCIADO}
        onChange={(e) => setFiltroFinanciado(e.value)}
        placeholder="Financiado"
      />
      <Dropdown
        value={filtroFase}
        options={opcionesFase}
        onChange={(e) => setFiltroFase(e.value)}
        placeholder="Última fase calificada"
      />
      {tabIndex === 1 && (
        <Dropdown
          value={filtroResultado}
          options={OPCIONES_RESULTADO}
          onChange={(e) => setFiltroResultado(e.value)}
          placeholder="Resultado"
        />
      )}
    </div>
  );
  
  
  return (
    <>
      <Toast ref={toast} />
      <div className="p-3">
        <h5 className="mb-3">Calificación de Proyectos</h5>
        {filtrosHeader}
        <TabView activeIndex={tabIndex} onTabChange={(e) => setTabIndex(e.index)}>
          <TabPanel header="Pendientes por calificar">
            <DataTable
              value={pendientesFiltrados}
              loading={loadingPendientes}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 20, 50]}
              emptyMessage="No hay proyectos pendientes de calificación."
              responsiveLayout="scroll"
            >
              <Column field="proyecto_titulo" header="Título del Proyecto" sortable />
              <Column field="convocatoria_nombre" header="Convocatoria" sortable />
              <Column header="Monto Aprobado" body={montoBodyTemplate} />
              <Column field="responsable" header="Responsable" sortable />
              <Column header="Última Fase Calificada" body={faseBodyTemplate} />
              <Column header="Corrección Docs." body={correccionBodyTemplate} />
              <Column header="Acciones" body={accionesPendientesTemplate} />
            </DataTable>
          </TabPanel>
          <TabPanel header="Calificados">
            <DataTable
              value={calificadosFiltrados}
              loading={loadingCalificados}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 20, 50]}
              emptyMessage="No hay proyectos con calificación finalizada."
              responsiveLayout="scroll"
            >
              <Column field="proyecto_titulo" header="Título del Proyecto" sortable />
              <Column field="convocatoria_nombre" header="Convocatoria" sortable />
              <Column header="Monto Aprobado" body={montoBodyTemplate} />
              <Column field="responsable" header="Responsable" sortable />
              <Column header="Resultado" body={resultadoBodyTemplate} />
              <Column header="Acciones" body={accionesCalificadosTemplate} />
            </DataTable>
          </TabPanel>
        </TabView>
      </div>

      <Dialog
        header={`Documentos de participación — ${docModalProyectoTitulo}`}
        visible={docModalVisible}
        style={{ width: '50vw' }}
        onHide={handleCerrarDocModal}
      >
        <DataTable
          value={documentosParticipacion}
          loading={loadingDocumentos}
          emptyMessage="Este proyecto no tiene documentos de participación registrados."
          responsiveLayout="scroll"
        >
          <Column field="tipo_documento_nombre" header="Tipo de Documento" />
          <Column field="version" header="Versión" />
          <Column
            header="Estado"
            body={(row) => <Tag value={row.estado} />}
          />
          <Column
            header=""
            body={(row) => (
              <Button
                icon="pi pi-download"
                className="p-button-rounded p-button-info p-button-sm"
                loading={descargandoDocumentoId === row.id}
                onClick={() => dispatch(descargarDocumentoParticipacion(row.id))}
              />
            )}
          />
        </DataTable>
      </Dialog>
    </>
  );
};

export default CalificacionTable;