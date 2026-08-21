// src/components/usuarios/NewUserModal.js
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { fetchMetadata } from "../../features/metadata/metadataSlice";
import { createUser } from "../../features/usuarios/usersSlice";
import { TIPOS_USUARIO_SOPORTE, resolverRolPlataforma } from "../../features/usuarios/tipos_usuario_soporte";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Modal de creación de usuario para el rol EsSoporte.
 *
 * Reemplaza al formulario original de usuarios.html (Thymeleaf), que tenía
 * un único checkbox "Admin" + radio Facultad/Grupo posteando a 3 rutas
 * fijas (usuarioSinGrupoNiFacultad / usuarioConFacultad / usuarioConGrupo).
 *
 * El backend migrado (apps/integracion/views/vinculacion_viewset.py) separó
 * eso en 12 endpoints, uno por rol de plataforma. De esos, EsSoporte puede
 * usar 9 (los otros 3 — estudiante/jurado/tutor — son de EsFacultad).
 * Este componente reemplaza el checkbox/radio por un único Dropdown "Tipo
 * de usuario" que determina a la vez el endpoint a llamar y qué campos
 * adicionales pedir (facultad+rolGrupo, grupo+rolGrupo, o ninguno).
 *
 * A diferencia del original: no se piden username/password (el backend los
 * autogenera y envía las credenciales por correo -
 * VinculacionService._crear_usuario), ni fecha de vinculación (el backend
 * la fija siempre a "hoy" en la creación, ver _crear_vinculacion_facultad /
 * _crear_vinculacion_grupo).
 */
const NewUserModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const {
    grados,
    roles,
    facultades,
    grupos,
    rolesGrupo,
    loading: metadataLoading,
  } = useSelector((state) => state.metadata);
  const { loading: userCreationLoading, error: userCreationError } = useSelector(
    (state) => state.usuarios
  );

  const [tipoKey, setTipoKey] = useState(null);
  const [formData, setFormData] = useState({});
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [validationError, setValidationError] = useState("");

  const tipoSeleccionado = useMemo(
    () => TIPOS_USUARIO_SOPORTE.find((t) => t.key === tipoKey) ?? null,
    [tipoKey]
  );

  const rolPlataformaResuelto = useMemo(
    () => resolverRolPlataforma(roles, tipoSeleccionado),
    [roles, tipoSeleccionado]
  );

  useEffect(() => {
    if (visible && grados.length === 0) {
      dispatch(fetchMetadata());
    }
  }, [visible, dispatch, grados.length]);

  useEffect(() => {
    if (!visible) {
      setTipoKey(null);
      setFormData({});
      setValidationError("");
    }
  }, [visible]);

  const handleInputChange = (e, name) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleTipoChange = (e) => {
    setTipoKey(e.value);
    // Al cambiar de tipo, los campos de facultad/grupo/rolGrupo del tipo
    // anterior dejan de aplicar; se limpian para no arrastrar valores
    // inválidos entre flujos distintos.
    setFormData((prev) => ({
      grado: prev.grado,
      nombre: prev.nombre,
      apellido: prev.apellido,
      documento: prev.documento,
      celular: prev.celular,
      correo: prev.correo,
      cvlac: prev.cvlac,
    }));
    setValidationError("");
  };

  const validarFormulario = () => {
    if (!tipoSeleccionado) {
      setValidationError("Debe seleccionar un tipo de usuario.");
      return false;
    }
    if (!rolPlataformaResuelto) {
      setValidationError(
        `No se encontró en el sistema el rol de plataforma para "${tipoSeleccionado.label}". ` +
          `Verifique que exista un RolPlataforma cuyo nombre coincida (ver roles-plataforma en el backend).`
      );
      return false;
    }
    const camposComunes = ["grado", "nombre", "apellido", "documento", "celular", "correo"];
    for (const campo of camposComunes) {
      if (!formData[campo]) {
        setValidationError(`El campo '${campo}' es obligatorio.`);
        return false;
      }
    }
    if (tipoSeleccionado.flujo === "facultad") {
      if (!formData.facultad) {
        setValidationError("La facultad es obligatoria para este tipo de usuario.");
        return false;
      }
      if (!formData.rolGrupo) {
        setValidationError("El rol dentro de la facultad es obligatorio.");
        return false;
      }
    }
    if (tipoSeleccionado.flujo === "grupo") {
      if (!formData.grupo) {
        setValidationError("El grupo de investigación es obligatorio para este tipo de usuario.");
        return false;
      }
      if (!formData.rolGrupo) {
        setValidationError("El rol dentro del grupo es obligatorio.");
        return false;
      }
    }
    setValidationError("");
    return true;
  };

  const handleShowConfirmation = () => {
    if (!validarFormulario()) return;
    onHide();
    setIsConfirmVisible(true);
  };

  const construirPayload = () => {
    // Nombres de campo tal cual los exige VinculacionValidator
    // (apps/integracion/validators/vinculacion_validator.py).
    const payload = {
      grado_id: formData.grado,
      nombre: formData.nombre,
      apellido: formData.apellido,
      documento: formData.documento,
      celular: formData.celular,
      correo: formData.correo,
      rol_plataforma_id: rolPlataformaResuelto.id,
    };
    if (formData.cvlac) payload.cvlac = formData.cvlac;
    if (tipoSeleccionado.flujo === "facultad") {
      payload.facultad_id = formData.facultad;
      payload.rol_grupo_id = formData.rolGrupo;
    }
    if (tipoSeleccionado.flujo === "grupo") {
      payload.grupo_id = formData.grupo;
      payload.rol_grupo_id = formData.rolGrupo;
    }
    return payload;
  };

  const handleRegister = () => {
    dispatch(
      createUser({ endpoint: tipoSeleccionado.endpoint, payload: construirPayload() })
    ).then((result) => {
      if (createUser.fulfilled.match(result)) {
        setIsConfirmVisible(false);
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Registrar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <Dialog header="Nuevo Usuario" visible={visible} style={{ width: "50vw" }} footer={renderFooter} onHide={onHide}>
      <div className="p-fluid">
        <div className="field col-12">
          <span className="p-float-label">
            <Dropdown
              inputId="tipoUsuario"
              value={tipoKey}
              options={TIPOS_USUARIO_SOPORTE}
              onChange={handleTipoChange}
              optionLabel="label"
              optionValue="key"
              placeholder="Seleccione un tipo de usuario"
              loading={metadataLoading}
            />
            <label htmlFor="tipoUsuario">Tipo de usuario</label>
          </span>
        </div>

        {tipoSeleccionado && !rolPlataformaResuelto && !metadataLoading && (
          <Message
            severity="warn"
            className="mt-2 w-full"
            text={`No se encontró el rol de plataforma "${tipoSeleccionado.label}" en el sistema. No se podrá registrar hasta que exista en RolPlataforma.`}
          />
        )}

        {tipoSeleccionado && (
          <div className="formgrid grid mt-4">
            <div className="field col-12 md:col-6">
              <span className="p-float-label">
                <Dropdown
                  inputId="grado"
                  value={formData.grado}
                  options={grados}
                  onChange={(e) => handleInputChange(e, "grado")}
                  optionLabel="descripcion"
                  optionValue="id"
                  filter
                  placeholder="Seleccione un Grado"
                  loading={metadataLoading}
                />
                <label htmlFor="grado">Grado</label>
              </span>
            </div>
            <div className="field col-12 md:col-6">
              <span className="p-float-label">
                <InputText id="nombre" value={formData.nombre || ""} onChange={(e) => handleInputChange(e, "nombre")} />
                <label htmlFor="nombre">Nombre</label>
              </span>
            </div>
            <div className="field col-12 md:col-6">
              <span className="p-float-label">
                <InputText id="apellido" value={formData.apellido || ""} onChange={(e) => handleInputChange(e, "apellido")} />
                <label htmlFor="apellido">Apellido</label>
              </span>
            </div>
            <div className="field col-12 md:col-6">
              <span className="p-float-label">
                <InputText id="documento" keyfilter="int" value={formData.documento || ""} onChange={(e) => handleInputChange(e, "documento")} />
                <label htmlFor="documento">Documento</label>
              </span>
            </div>
            <div className="field col-12 md:col-6">
              <span className="p-float-label">
                <InputText id="celular" keyfilter="int" value={formData.celular || ""} onChange={(e) => handleInputChange(e, "celular")} />
                <label htmlFor="celular">Celular</label>
              </span>
            </div>
            <div className="field col-12 md:col-6">
              <span className="p-float-label">
                <InputText id="correo" type="email" value={formData.correo || ""} onChange={(e) => handleInputChange(e, "correo")} />
                <label htmlFor="correo">Correo Institucional</label>
              </span>
            </div>
            <div className="field col-12">
              <span className="p-float-label">
                <InputText id="cvlac" value={formData.cvlac || ""} onChange={(e) => handleInputChange(e, "cvlac")} />
                <label htmlFor="cvlac">CVLAC (Opcional)</label>
              </span>
            </div>

            {tipoSeleccionado.flujo === "facultad" && (
              <>
                <div className="field col-12 md:col-6">
                  <span className="p-float-label">
                    <Dropdown
                      inputId="facultad"
                      value={formData.facultad}
                      options={facultades}
                      onChange={(e) => handleInputChange(e, "facultad")}
                      optionLabel="nombre_facultad"
                      optionValue="id"
                      filter
                      placeholder="Seleccione una Facultad"
                      loading={metadataLoading}
                    />
                    <label htmlFor="facultad">Facultad</label>
                  </span>
                </div>
                <div className="field col-12 md:col-6">
                  <span className="p-float-label">
                    <Dropdown
                      inputId="rolGrupo"
                      value={formData.rolGrupo}
                      options={rolesGrupo}
                      onChange={(e) => handleInputChange(e, "rolGrupo")}
                      optionLabel="cargo"
                      optionValue="id"
                      filter
                      placeholder="Seleccione Rol en la Facultad"
                      loading={metadataLoading}
                    />
                    <label htmlFor="rolGrupo">Rol en la Facultad</label>
                  </span>
                </div>
              </>
            )}

            {tipoSeleccionado.flujo === "grupo" && (
              <>
                <div className="field col-12 md:col-6">
                  <span className="p-float-label">
                    <Dropdown
                      inputId="grupo"
                      value={formData.grupo}
                      options={grupos}
                      onChange={(e) => handleInputChange(e, "grupo")}
                      optionLabel="nombre_grupo"
                      optionValue="id"
                      filter
                      placeholder="Seleccione un Grupo"
                      loading={metadataLoading}
                    />
                    <label htmlFor="grupo">Grupo de Investigación</label>
                  </span>
                </div>
                <div className="field col-12 md:col-6">
                  <span className="p-float-label">
                    <Dropdown
                      inputId="rolGrupo"
                      value={formData.rolGrupo}
                      options={rolesGrupo}
                      onChange={(e) => handleInputChange(e, "rolGrupo")}
                      optionLabel="cargo"
                      optionValue="id"
                      filter
                      placeholder="Seleccione Rol en el Equipo"
                      loading={metadataLoading}
                    />
                    <label htmlFor="rolGrupo">Rol en el Equipo</label>
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {userCreationError && (
          <Message
            severity="error"
            className="mt-3 w-full"
            text={typeof userCreationError === "string" ? userCreationError : "Error al crear el usuario."}
          />
        )}
      </div>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleRegister}
        header="¿Deseas confirmar la acción?"
        loading={userCreationLoading}
      >
        <h6>Resumen de datos ingresados:</h6>
        <ul>
          <li><strong>Tipo de usuario:</strong> {tipoSeleccionado?.label || "N/A"}</li>
          <li><strong>Grado:</strong> {grados.find((g) => g.id === formData.grado)?.descripcion || "N/A"}</li>
          <li><strong>Nombre:</strong> {formData.nombre || "N/A"}</li>
          <li><strong>Apellido:</strong> {formData.apellido || "N/A"}</li>
          <li><strong>Documento:</strong> {formData.documento || "N/A"}</li>
          <li><strong>Correo:</strong> {formData.correo || "N/A"}</li>
          <li><strong>Rol en plataforma:</strong> {rolPlataformaResuelto?.nombre_rol || "N/A"}</li>
          {tipoSeleccionado?.flujo === "facultad" && (
            <>
              <li><strong>Facultad:</strong> {facultades.find((f) => f.id === formData.facultad)?.nombre_facultad || "N/A"}</li>
              <li><strong>Rol en la facultad:</strong> {rolesGrupo.find((r) => r.id === formData.rolGrupo)?.cargo || "N/A"}</li>
            </>
          )}
          {tipoSeleccionado?.flujo === "grupo" && (
            <>
              <li><strong>Grupo:</strong> {grupos.find((g) => g.id === formData.grupo)?.nombre_grupo || "N/A"}</li>
              <li><strong>Rol en el equipo:</strong> {rolesGrupo.find((r) => r.id === formData.rolGrupo)?.cargo || "N/A"}</li>
            </>
          )}
        </ul>
        <p className="text-sm text-color-secondary">
          La contraseña temporal se generará automáticamente y se enviará por correo al usuario.
        </p>
      </ConfirmationModal>
    </Dialog>
  );
};

export default NewUserModal;