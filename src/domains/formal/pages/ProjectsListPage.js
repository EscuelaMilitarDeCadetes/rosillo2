// src/domains/formal/pages/ProjectsListPage.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import {
  fetchMisProyectos,
  fetchProyectosPorFacultad,
  fetchProyectosPorGrupo,
  updateProjectDates,
} from "../features/proyectos/proyectosSlice";
import { updateBudget } from "../features/proyectos/montoSlice";
import useHasRole from "../hooks/useHasRole";
import useProjectFilters from "../hooks/useProjectFilters";
import useOpcionesFiltroProyectos from "../hooks/useOpcionesFiltroProyectos";
import useOpcionesResponsable from "../hooks/useOpcionesResponsable";
import RegisterInvestigatorModal from "../components/proyectos/RegisterInvestigatorModal";
import AddProductoProyectoModal from "../components/proyectos/AddProductProjectModal";
import AddObjetivoModal from "../components/proyectos/AddObjetivoModal";
import InvestigadoresProyectoTable from "../components/proyectos/InvestigadoresProyectoTable";
import ProductosProyectoTable from "../components/proyectos/ProductosProyectoTable";
import ConfirmationModal from "../components/common/ConfirmationModal";

const ESTADO_A_CALIFICACION = {
  aprobado: "APROBADO",
  rechazado: "NO_APROBADO",
};

const ProjectsListPage = () => {
  const dispatch = useDispatch();
  const toast = React.useRef(null);
  const [searchParams] = useSearchParams();
  const estadoParam = searchParams.get("estado"); // 'aprobado' | 'rechazado' | null
  const tipoParam = searchParams.get("tipo"); // 'externo' | null
  const rolParam = searchParams.get("rol"); // 'supervisor' | 'facultad' | 'grupo' | null
  const esModoExterno = tipoParam === "externo";

  const [modalInvVisible, setModalInvVisible] = useState(false);
  const [modalProdVisible, setModalProdVisible] = useState(false);
  const [proyectoIdModal, setProyectoIdModal] = useState(null);

  const calificacion = esModoExterno
    ? "APROBADO"
    : ESTADO_A_CALIFICACION[estadoParam] || null;

  const puedeGestionar = useHasRole(
    esModoExterno ? ["CEXTERNO"] : ["CINTERNO", "CEXTERNO"]
  );

  const { filteredProjects, totalProjects, loading, proyectosPorRol, loadingProyectosPorRol } = useSelector(
    (state) => state.proyectos
  );
  const { facultadId, grupoId } = useSelector((state) => state.auth);

  const { filtros, setFiltros, page, setPage } = useProjectFilters({ calificacion, esModoExterno, rolParam });
  const opcionesFiltro = useOpcionesFiltroProyectos();
  const { opcionesResponsableAgrupadas } = useOpcionesResponsable();

  const [modalMontoVisible, setModalMontoVisible] = useState(false);
  const [modalFechasVisible, setModalFechasVisible] = useState(false);
  const [modalInvestigadorVisible, setModalInvestigadorVisible] = useState(false);
  const [modalProductoVisible, setModalProductoVisible] = useState(false);
  const [modalObjetivoVisible, setModalObjetivoVisible] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [proyectoIdAccion, setProyectoIdAccion] = useState(null);
  const [aprobado, setAprobado] = useState(0);
  const [contrapartida, setContrapartida] = useState(0);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [fechasError, setFechasError] = useState("");
  const [isConfirmFechasVisible, setIsConfirmFechasVisible] = useState(false);

  const datosTabla = rolParam ? proyectosPorRol : filteredProjects;
  const cargandoTabla = rolParam ? loadingProyectosPorRol : loading;

  useEffect(() => {
    if (rolParam === "supervisor") {
      dispatch(fetchMisProyectos());
    } else if (rolParam === "facultad" && facultadId) {
      dispatch(fetchProyectosPorFacultad(facultadId));
    } else if (rolParam === "grupo" && grupoId) {
      dispatch(fetchProyectosPorGrupo(grupoId));
    }
  }, [dispatch, rolParam, facultadId, grupoId]);  

  const abrirModalMonto = (rowData) => {
    setProyectoSeleccionado(rowData);
    setAprobado(0);
    setContrapartida(0);
    setModalMontoVisible(true);
  };

  const abrirModalFechas = (rowData) => {
    setProyectoSeleccionado(rowData);
    setFechaInicio(null);
    setFechaFin(null);
    setFechasError("");
    setModalFechasVisible(true);
  };

  const abrirModalInvestigador = (rowData) => {
    setProyectoIdAccion(rowData.proyecto);
    setModalInvestigadorVisible(true);
  };

  const abrirModalProducto = (rowData) => {
    setProyectoIdAccion(rowData.proyecto);
    setModalProductoVisible(true);
  };

  const abrirModalObjetivo = (rowData) => {
    setProyectoIdAccion(rowData.proyecto);
    setModalObjetivoVisible(true);
  };

  const confirmarMonto = () => {
    dispatch(
      updateBudget({
        montoId: proyectoSeleccionado.monto_id,
        data: { aprobado, contrapartida },
      })
    )
      .unwrap()
      .then(() => {
        toast.current?.show({ severity: "success", summary: "Monto asignado" });
        setModalMontoVisible(false);
      })
      .catch((err) =>
        toast.current?.show({ severity: "error", summary: "Error", detail: err })
      );
  };

  const validarFechas = () => {
    if (!fechaInicio || !fechaFin) {
      setFechasError("Debe ingresar la fecha de inicio y la fecha de finalización.");
      return false;
    }
    setFechasError("");
    return true;
  };

  const handleShowConfirmacionFechas = () => {
    if (validarFechas()) {
      setModalFechasVisible(false);
      setIsConfirmFechasVisible(true);
    }
  };

  const confirmarFechas = () => {
    dispatch(
      updateProjectDates({
        proyectoId: proyectoSeleccionado.proyecto,
        data: {
          fecha_inicio: fechaInicio?.toISOString().slice(0, 10),
          fecha_fin: fechaFin?.toISOString().slice(0, 10),
        },
      })
    )
      .unwrap()
      .then(() => {
        toast.current?.show({ severity: "success", summary: "Fechas asignadas" });
        setIsConfirmFechasVisible(false);
      })
      .catch((err) => {
        toast.current?.show({ severity: "error", summary: "Error", detail: err });
        setIsConfirmFechasVisible(false);
      });
  };

  const montoFormateado = (valor) =>
    valor != null
      ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(valor)
      : "N/A";

  const montoTemplate = (row) =>
    row.monto_aprobado != null
      ? montoFormateado(row.monto_aprobado)
      : "No asignado";

  const tituloTemplate = (row) => (
    <Link to={`/proyectos/${row.proyecto}`} className="text-decoration-none">
      {row.proyecto_titulo}
    </Link>
  );

  const accionesTemplateExterno = (row) => {
    if (!puedeGestionar) return null;
    return (
      <div className="d-flex flex-wrap gap-2">
        {row.proyecto_fecha_inicio === "2000-01-01" && (
          <Button
            label="Asignar Tiempos"
            className="p-button-sm p-button-secondary"
            onClick={() => abrirModalFechas(row)}
          />
        )}
        <Button
          label="Crear Investigadores"
          className="p-button-sm p-button-warning"
          onClick={() => abrirModalInvestigador(row)}
        />
        <Button
          label="Asignar Productos"
          className="p-button-sm p-button-info"
          onClick={() => abrirModalProducto(row)}
        />
        <Button
          label="Asignar Objetivos"
          className="p-button-sm p-button-help"
          onClick={() => abrirModalObjetivo(row)}
        />
      </div>
    );
  };

  const accionesTemplate = (row) => {
    if (!puedeGestionar || calificacion !== "APROBADO") return null;
    return (
      <div className="d-flex gap-2">
        {row.monto_solicitado && !row.monto_aprobado && (
          <Button
            label="Asignar Monto"
            className="p-button-sm p-button-info"
            onClick={() => abrirModalMonto(row)}
          />
        )}
        {row.proyecto_fecha_inicio === "2000-01-01" && (
          <Button
            label="Asignar Tiempos"
            className="p-button-sm p-button-secondary"
            onClick={() => abrirModalFechas(row)}
          />
        )}
      </div>
    );
  };

  const investigadoresTemplate = (row) =>
    row.tiene_investigadores ? (
      <Button label="VER MÁS" className="p-button-text p-button-sm"
        onClick={() => { setProyectoIdModal(row.proyecto); setModalInvVisible(true); }} />
    ) : (
      <span style={{ color: "gray" }}>Sin investigadores</span>
    );

  const productosTemplate = (row) =>
    row.tiene_productos ? (
      <Button label="VER MÁS" className="p-button-text p-button-sm"
        onClick={() => { setProyectoIdModal(row.proyecto); setModalProdVisible(true); }} />
    ) : (
      <span style={{ color: "gray" }}>Sin productos</span>
    );

  const titulo = esModoExterno
    ? "Proyectos Externos Aprobados"
    : rolParam === "supervisor"
      ? "Mis Proyectos"
      : rolParam === "facultad"
        ? "Proyectos de mi Facultad"
        : rolParam === "grupo"
          ? "Proyectos de mi Grupo"
    : calificacion === "APROBADO"
      ? "Proyectos Aprobados"
      : calificacion === "NO_APROBADO"
        ? "Proyectos Rechazados"
        : "Proyectos";

  return (
    <div className="container-fluid mt-4">
      <Toast ref={toast} />
      <h4 className="mb-3">{titulo}</h4>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <Dropdown
          placeholder="Convocatoria"
          options={opcionesFiltro.convocatorias}
          value={filtros.convocatoria}
          onChange={(e) => setFiltros({ ...filtros, convocatoria: e.value })}
          filter
          showClear
        />
        <InputText
          placeholder="Código"
          value={filtros.codigo}
          onChange={(e) => setFiltros({ ...filtros, codigo: e.target.value })}
        />
        <InputText
          placeholder="Título"
          value={filtros.titulo}
          onChange={(e) => setFiltros({ ...filtros, titulo: e.target.value })}
        />
        <Dropdown
          placeholder="Financiado"
          options={[
            { label: "Sí", value: true },
            { label: "No", value: false },
          ]}
          value={filtros.financiado}
          onChange={(e) => setFiltros({ ...filtros, financiado: e.value })}
          showClear
        />
        <Dropdown
          placeholder="Responsable"
          options={opcionesResponsableAgrupadas}
          optionGroupLabel="label"
          optionGroupChildren="items"
          value={filtros.responsable}
          onChange={(e) => setFiltros({ ...filtros, responsable: e.value })}
          showClear
        />
        <Dropdown
          placeholder="Tiene Alianza"
          options={[
            { label: "Sí", value: true },
            { label: "No", value: false },
          ]}
          value={filtros.alianza}
          onChange={(e) => setFiltros({ ...filtros, alianza: e.value })}
          showClear
        />
        <Dropdown
          placeholder="Año convocatoria"
          options={opcionesFiltro.aniosConvocatoria}
          value={filtros.anio_convocatoria}
          onChange={(e) => setFiltros({ ...filtros, anio_convocatoria: e.value })}
          showClear
        />
        <Dropdown
          placeholder="Año de inicio"
          options={opcionesFiltro.aniosInicio}
          value={filtros.anio_inicio}
          onChange={(e) => setFiltros({ ...filtros, anio_inicio: e.value })}
          showClear
        />
        <Dropdown
          placeholder="Año de cierre"
          options={opcionesFiltro.aniosFin}
          value={filtros.anio_fin}
          onChange={(e) => setFiltros({ ...filtros, anio_fin: e.value })}
          showClear
        />
      </div>
      <DataTable
        value={datosTabla}
        loading={cargandoTabla}
        paginator
        rows={10}
        {...(!rolParam && {
          totalRecords: totalProjects,
          lazy: true,
          first: (page - 1) * 10,
          onPage: (e) => setPage(e.page + 1),
        })}
        emptyMessage="No hay registros disponibles."
        responsiveLayout="scroll"
      >
        <Column field="convocatoria_nombre" header="Convocatoria" />
        <Column field="convocatoria_anio" header="Año Convocatoria" />
        <Column field="proyecto_codigo" header="Código" />
        <Column header="Título" body={tituloTemplate} />
        {esModoExterno && (
          <Column
            header="Inicio"
            body={(r) =>
              r.proyecto_fecha_inicio
                ? new Date(r.proyecto_fecha_inicio + "T00:00:00").toLocaleDateString("es-CO")
                : "-"
            }
          />
        )}
        <Column header="Financiado" body={(r) => (r.proyecto_financiado ? "SI" : "NO")} />
        <Column header="Responsable" body={(r) => r.responsable ?? "-"} />
        <Column header="Valor Solicitado" body={(r) => montoFormateado(r.monto_solicitado)} />
        <Column header="Monto Aprobado" body={montoTemplate} />
        <Column header="Valor Contrapartida" body={(r) => montoFormateado(r.monto_contrapartida)} />
        <Column header="Valor Total" body={(r) => montoFormateado(r.monto_total)} />
        {esModoExterno && (
          <Column header="gruLAC" body={(r) => (r.proyecto_gruplac ? "SI" : "NO")} />
        )}
        {esModoExterno ? (
          <Column header="Acciones" body={accionesTemplateExterno} />
        ) : (
          calificacion === "APROBADO" && (
            <Column header="Acciones" body={accionesTemplate} />
          )
        )}
        <Column header="Investigadores" body={investigadoresTemplate} />
        <Column header="Productos" body={productosTemplate} />
      </DataTable>
      <Dialog
        header="Gestión del monto"
        visible={modalMontoVisible}
        onHide={() => setModalMontoVisible(false)}
      >
        <div className="mb-3">
          <label>Valor aprobado</label>
          <InputNumber
            value={aprobado}
            onValueChange={(e) => setAprobado(e.value)}
            mode="currency"
            currency="COP"
            locale="es-CO"
            className="w-100"
          />
        </div>
        <div className="mb-3">
          <label>Valor contrapartida</label>
          <InputNumber
            value={contrapartida}
            onValueChange={(e) => setContrapartida(e.value)}
            mode="currency"
            currency="COP"
            locale="es-CO"
            className="w-100"
          />
        </div>
        <Button label="Asignar Monto" className="p-button-success" onClick={confirmarMonto} />
      </Dialog>
      <Dialog
        header="Línea de Tiempo"
        visible={modalFechasVisible}
        onHide={() => { setModalFechasVisible(false); setFechasError(""); }}
      >
        <div className="mb-3">
          <label>Fecha de inicio</label>
          <Calendar
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.value)}
            dateFormat="yy-mm-dd"
            className="w-100"
          />
        </div>
        <div className="mb-3">
          <label>Fecha de finalización</label>
          <Calendar
            value={fechaFin}
            onChange={(e) => setFechaFin(e.value)}
            dateFormat="yy-mm-dd"
            className="w-100"
          />
        </div>
        {fechasError && <div className="alert alert-danger mt-2">{fechasError}</div>}
        <Button label="Cargar" className="p-button-success" onClick={handleShowConfirmacionFechas} />
      </Dialog>
      <ConfirmationModal
        visible={isConfirmFechasVisible}
        onHide={() => setIsConfirmFechasVisible(false)}
        onConfirm={confirmarFechas}
        header="Confirmar asignación de fechas"
        loading={loading}
      >
        <h6>Resumen de datos ingresados:</h6>
        <ul>
          <li><strong>Fecha de inicio:</strong> {fechaInicio ? fechaInicio.toLocaleDateString("es-CO") : "Vacío"}</li>
          <li><strong>Fecha de finalización:</strong> {fechaFin ? fechaFin.toLocaleDateString("es-CO") : "Vacío"}</li>
        </ul>
      </ConfirmationModal>
      <Dialog header="Investigadores del proyecto" visible={modalInvVisible} style={{ width: "60vw" }} onHide={() => setModalInvVisible(false)}>
        {proyectoIdModal && (
          <InvestigadoresProyectoTable proyectoId={proyectoIdModal} readOnly={esModoExterno} />
        )}
      </Dialog>
      <Dialog header="Productos del proyecto" visible={modalProdVisible} style={{ width: "60vw" }} onHide={() => setModalProdVisible(false)}>
        {proyectoIdModal && (
          <ProductosProyectoTable proyectoId={proyectoIdModal} readOnly={esModoExterno} />
        )}
      </Dialog>
      <RegisterInvestigatorModal
        visible={modalInvestigadorVisible}
        onHide={() => setModalInvestigadorVisible(false)}
        proyectoId={proyectoIdAccion}
      />
      <AddProductoProyectoModal
        visible={modalProductoVisible}
        onHide={() => setModalProductoVisible(false)}
        proyectoId={proyectoIdAccion}
      />
      <AddObjetivoModal
        visible={modalObjetivoVisible}
        onHide={() => setModalObjetivoVisible(false)}
        proyectoId={proyectoIdAccion}
      />
    </div>
  );
};

export default ProjectsListPage;