// src/domains/formal/pages/CrearProyectoExternoPage.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { crearProyectoExterno } from "../../../features/proyectos/proyectosSlice";
import {
  addDocumentoProyecto,
  fetchTiposDocumentoProyecto,
} from "../../../features/proyectos/documentosSlice";
import { fetchGerenteActual } from "../../../features/gerentes/gerentesSlice";

const OPCIONES_ENTIDAD = [
  { label: "CRI - Centro de Rehabilitación Inclusiva", value: "CRI" },
  { label: "COATE - Comando de Apoyo Tecnológico", value: "COATE" },
  { label: "COTEF - Comando de Transformación del Ejército del Futuro", value: "COTEF" },
  { label: "DITEC - Dirección de Ciencia y Tecnología", value: "DITEC" },
  { label: "MINCIENCIAS - Ministerio de Ciencia Tecnología e Innovación", value: "MINCIENCIAS" },
];

const FORM_INICIAL = {
  entidad: null,
  titulo: "",
  unidadEjecutora: "",
  lineaInvestigacion: "",
  financiado: false,
  valorSolicitado: 0,
  alianza: false,
  docProyecto: null,
  docCarta: null,
  docAlianza: null,
};


const CrearProyectoExternoPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = React.useRef(null);

  const { user } = useSelector((state) => state.auth);
  const { actual: gerenteActual, actualLoading } = useSelector((state) => state.gerentes);
  const { tiposDocumentoProyecto } = useSelector((state) => state.documentos);

  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    dispatch(fetchGerenteActual());
    dispatch(fetchTiposDocumentoProyecto());
  }, [dispatch]);

  const setCampo = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const validar = () => {
    if (!form.entidad || !form.titulo.trim() || !form.unidadEjecutora.trim() || !form.lineaInvestigacion.trim()) {
      setError("Complete entidad, título, unidad ejecutora y línea de investigación.");
      return false;
    }
    if (!form.docProyecto) {
      setError("Debe adjuntar el documento del proyecto.");
      return false;
    }
    if (form.docProyecto.type !== "application/pdf") {
      setError("El documento del proyecto debe ser un PDF.");
      return false;
    }
    if (form.docCarta && form.docCarta.type !== "application/pdf") {
      setError("El documento de carta debe ser un PDF.");
      return false;
    }
    if (form.alianza && form.docAlianza && form.docAlianza.type !== "application/pdf") {
      setError("El documento de alianza debe ser un PDF.");
      return false;
    }
    if (!gerenteActual) {
      setError("No hay un gerente vigente registrado; no es posible crear el proyecto. Contacte a soporte.");
      return false;
    }
    return true;
  };

  const subirDocumentos = async (proyectoId) => {
    const documentos = [
      { nombre: "Proyecto", archivo: form.docProyecto },
      { nombre: "Carta de Postulación", archivo: form.docCarta },
      ...(form.alianza ? [{ nombre: "Alianzas", archivo: form.docAlianza }] : []),
    ];
    for (const doc of documentos) {
      if (!doc.archivo) continue;
      const tipoDocumentoId = tiposDocumentoProyecto.find(
        (td) => td.nombre_documento === doc.nombre
      )?.id;
      if (!tipoDocumentoId) continue;
      try {
        await dispatch(
          addDocumentoProyecto({
            proyectoId,
            data: { tipo_documento: tipoDocumentoId, documento_file: doc.archivo },
          })
        ).unwrap();
      } catch {
        toast.current?.show({
          severity: "warn",
          summary: "Documento no subido",
          detail: `El proyecto se creó, pero '${doc.nombre}' no se pudo subir. Puede intentarlo de nuevo desde el detalle del proyecto.`,
        });
      }
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!validar()) return;
    setGuardando(true);
    try {
      const proyecto = await dispatch(
        crearProyectoExterno({
          usuario: user.id,
          gerente: gerenteActual.id,
          titulo: form.titulo.trim(),
          unidad_ejecutora: form.unidadEjecutora.trim(),
          linea_investigacion: form.lineaInvestigacion.trim(),
          entidad: form.entidad,
          valor_solicitado: form.financiado ? form.valorSolicitado || 0 : 0,
          alianza: form.alianza,
          financiado: form.financiado,
        })
      ).unwrap();

      await subirDocumentos(proyecto.id);

      toast.current?.show({
        severity: "success",
        summary: "Proyecto externo creado",
        detail: "El proyecto se creó y quedó aprobado automáticamente.",
      });
      navigate("/proyectos?tipo=externo");
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error al crear proyecto externo",
        detail: typeof err === "string" ? err : "No se pudo crear el proyecto externo.",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <Toast ref={toast} />
      <h3 className="mb-3 text-center">Proyectos Externos</h3>
      <p className="text-center">Señor usuario a continuación registre los datos del proyecto</p>

      <div className="border rounded p-4 mt-4">
        <h5 className="mb-3">Formulario de creación de proyecto externo</h5>

        {!actualLoading && !gerenteActual && (
          <div className="alert alert-warning">
            No hay un gerente vigente registrado en la plataforma. No podrá guardar el
            proyecto hasta que soporte asigne uno.
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="field mb-3">
          <label className="form-label d-block">Entidad</label>
          <Dropdown
            className="w-100"
            options={OPCIONES_ENTIDAD}
            value={form.entidad}
            onChange={(e) => setCampo("entidad", e.value)}
            placeholder="Seleccione una entidad"
          />
        </div>

        <div className="field mb-3">
          <label className="form-label d-block">Unidad Ejecutora</label>
          <InputText
            className="w-100"
            value={form.unidadEjecutora}
            onChange={(e) => setCampo("unidadEjecutora", e.target.value)}
          />
        </div>

        <div className="field mb-3">
          <label className="form-label d-block">Línea de Investigación</label>
          <InputText
            className="w-100"
            value={form.lineaInvestigacion}
            onChange={(e) => setCampo("lineaInvestigacion", e.target.value)}
          />
        </div>

        <div className="field mb-3">
          <label className="form-label d-block">Título</label>
          <InputText
            className="w-100"
            value={form.titulo}
            onChange={(e) => setCampo("titulo", e.target.value)}
          />
        </div>

        <div className="field mb-3 d-flex align-items-center gap-2">
          <Checkbox
            inputId="financiado"
            checked={form.financiado}
            onChange={(e) => setCampo("financiado", e.checked)}
          />
          <label htmlFor="financiado" className="form-label mb-0">Financiado</label>
        </div>

        {form.financiado && (
          <div className="field mb-3">
            <label className="form-label d-block">Monto Solicitado</label>
            <InputNumber
              className="w-100"
              value={form.valorSolicitado}
              onValueChange={(e) => setCampo("valorSolicitado", e.value)}
              mode="currency"
              currency="COP"
              locale="es-CO"
            />
          </div>
        )}

        <div className="field mb-3 d-flex align-items-center gap-2">
          <Checkbox
            inputId="alianza"
            checked={form.alianza}
            onChange={(e) => setCampo("alianza", e.checked)}
          />
          <label htmlFor="alianza" className="form-label mb-0">Alianza</label>
        </div>

        <div className="field mb-3">
          <label className="form-label d-block">Documento proyecto (PDF, requerido)</label>
          <FileUpload
            name="docProyecto"
            customUpload
            uploadHandler={(e) => setCampo("docProyecto", e.files[0])}
            chooseLabel="Seleccionar"
            mode="basic"
            auto
            accept=".pdf"
            maxFileSize={15000000}
          />
          {form.docProyecto && <small className="ms-2">{form.docProyecto.name}</small>}
        </div>

        <div className="field mb-3">
          <label className="form-label d-block">Documento carta (PDF, opcional)</label>
          <FileUpload
            name="docCarta"
            customUpload
            uploadHandler={(e) => setCampo("docCarta", e.files[0])}
            chooseLabel="Seleccionar"
            mode="basic"
            auto
            accept=".pdf"
            maxFileSize={15000000}
          />
          {form.docCarta && <small className="ms-2">{form.docCarta.name}</small>}
        </div>

        {form.alianza && (
          <div className="field mb-3">
            <label className="form-label d-block">Documento Alianza (PDF)</label>
            <FileUpload
              name="docAlianza"
              customUpload
              uploadHandler={(e) => setCampo("docAlianza", e.files[0])}
              chooseLabel="Seleccionar"
              mode="basic"
              auto
              accept=".pdf"
              maxFileSize={15000000}
            />
            {form.docAlianza && <small className="ms-2">{form.docAlianza.name}</small>}
          </div>
        )}

        <div className="text-center mt-4">
          <Button
            label={guardando ? "Guardando..." : "Registrar"}
            className="p-button-success"
            onClick={handleSubmit}
            disabled={guardando}
          />
        </div>
      </div>
    </div>
  );
};

export default CrearProyectoExternoPage;