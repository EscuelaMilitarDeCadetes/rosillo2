import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import { RadioButton } from "primereact/radiobutton";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { fetchMetadata } from "../../features/metadata/metadataSlice";
import { createUser } from "../../features/usuarios/usersSlice";
import ConfirmationModal from "../common/ConfirmationModal"; // Importa el nuevo componente

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
  const { loading: userCreationLoading, error: userCreationError } =
    useSelector((state) => state.users);

  const [isAdmin, setIsAdmin] = useState(false);
  const [userType, setUserType] = useState(null); // 'facultad', 'grupo'
  const [formData, setFormData] = useState({
    // Estado inicial para los campos del formulario
  });

  // Estado para el modal de confirmación
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    // Cargar los metadatos si no están ya en el store
    if (visible && grados.length === 0) {
      dispatch(fetchMetadata());
    }
  }, [visible, dispatch, grados.length]);

  // Limpiar el formulario cuando el modal se cierra
  useEffect(() => {
    if (!visible) {
      setFormData({});
      setIsAdmin(false);
      setUserType(null);
    }
  }, [visible]);

  const handleInputChange = (e, name) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleShowConfirmation = () => {
    // Antes de mostrar la confirmación, oculta el formulario principal
    onHide();
    setIsConfirmVisible(true);
  };

  const handleRegister = () => {
    // Despacha la acción de Redux con los datos del formulario
    dispatch(createUser(formData)).then((result) => {
      if (createUser.fulfilled.match(result)) {
        setIsConfirmVisible(false); // Cierra el modal de confirmación
      }
    });
  };

  const renderFooter = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Registrar"
        icon="pi pi-check"
        onClick={handleShowConfirmation}
        autoFocus
      />
    </div>
  );

  const renderCommonFields = () => (
    <>
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
        <span className="p-float-label mt-4">
          <InputText
            id="nombre"
            name="nombre"
            value={formData.nombre || ""}
            onChange={(e) => handleInputChange(e, "nombre")}
          />
          <label htmlFor="nombre">Nombre</label>
        </span>
      </div>
      <div className="field col-12 md:col-6">
        <span className="p-float-label mt-4">
          <InputText
            id="apellido"
            name="apellido"
            value={formData.apellido || ""}
            onChange={(e) => handleInputChange(e, "apellido")}
          />
          <label htmlFor="apellido">Apellido</label>
        </span>
      </div>
      <div className="field col-12 md:col-6">
        <span className="p-float-label mt-4">
          <InputText
            id="documento"
            name="documento"
            keyfilter="int"
            value={formData.documento || ""}
            onChange={(e) => handleInputChange(e, "documento")}
          />
          <label htmlFor="documento">Documento</label>
        </span>
      </div>
      <div className="field col-12 md:col-6">
        <span className="p-float-label mt-4">
          <InputText
            id="celular"
            name="celular"
            keyfilter="int"
            value={formData.celular || ""}
            onChange={(e) => handleInputChange(e, "celular")}
          />
          <label htmlFor="celular">Celular</label>
        </span>
      </div>
      <div className="field col-12 md:col-6">
        <span className="p-float-label mt-4">
          <InputText
            id="correo"
            name="correo"
            type="email"
            value={formData.correo || ""}
            onChange={(e) => handleInputChange(e, "correo")}
          />
          <label htmlFor="correo">Correo</label>
        </span>
      </div>
      <div className="field col-12">
        <span className="p-float-label mt-4">
          <InputText
            id="cvlac"
            name="cvlac"
            value={formData.cvlac || ""}
            onChange={(e) => handleInputChange(e, "cvlac")}
          />
          <label htmlFor="cvlac">CVLAC (Opcional)</label>
        </span>
      </div>
    </>
  );

  return (
    <Dialog
      header="Nuevo Usuario"
      visible={visible}
      style={{ width: "50vw" }}
      footer={renderFooter}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field-checkbox text-center mb-4">
          <Checkbox
            inputId="isAdmin"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.checked)}
          />
          <label htmlFor="isAdmin" className="ms-2">
            Administrativo
          </label>
        </div>

        {!isAdmin && (
          <div className="d-flex justify-content-center gap-4 mb-4">
            <div className="field-radiobutton">
              <RadioButton
                inputId="typeFacultad"
                name="userType"
                value="facultad"
                onChange={(e) => setUserType(e.value)}
                checked={userType === "facultad"}
              />
              <label htmlFor="typeFacultad">Facultad</label>
            </div>
            <div className="field-radiobutton">
              <RadioButton
                inputId="typeGrupo"
                name="userType"
                value="grupo"
                onChange={(e) => setUserType(e.value)}
                checked={userType === "grupo"}
              />
              <label htmlFor="typeGrupo">Grupo</label>
            </div>
          </div>
        )}

        {/* Renderizado condicional de formularios */}
        <div className="formgrid grid mt-4">
          {isAdmin && (
            <>
              {renderCommonFields()}
              <div className="field col-12">
                <span className="p-float-label mt-4">
                  <Dropdown
                    inputId="rolPlataforma"
                    value={formData.rolPlataforma}
                    options={roles}
                    onChange={(e) => handleInputChange(e, "rolPlataforma")}
                    optionLabel="nombre_rol"
                    optionValue="id"
                    filter
                    placeholder="Seleccione un Rol"
                    loading={metadataLoading}
                  />
                  <label htmlFor="rolPlataforma">Rol en Plataforma</label>
                </span>
              </div>
            </>
          )}
          {userType === "facultad" && (
            <>
              {renderCommonFields()}
              <div className="field col-12">
                <span className="p-float-label mt-4">
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
            </>
          )}
          {userType === "grupo" && (
            <>
              {renderCommonFields()}
              <div className="field col-12 md:col-6">
                <span className="p-float-label mt-4">
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
                <span className="p-float-label mt-4">
                  <Dropdown
                    inputId="rolGrupo"
                    value={formData.rolGrupo}
                    options={rolesGrupo}
                    onChange={(e) => handleInputChange(e, "rolGrupo")}
                    optionLabel="cargo"
                    optionValue="id"
                    filter
                    placeholder="Seleccione Rol en Equipo"
                    loading={metadataLoading}
                  />
                  <label htmlFor="rolGrupo">Rol en el Equipo</label>
                </span>
              </div>
              <div className="field col-12">
                <span className="p-float-label mt-4">
                  <Calendar
                    inputId="vinculacion"
                    value={formData.vinculacion}
                    onChange={(e) => handleInputChange(e, "vinculacion")}
                    dateFormat="yy-mm-dd"
                  />
                  <label htmlFor="vinculacion">Fecha de Vinculación</label>
                </span>
              </div>
            </>
          )}
        </div>

        {userCreationError && (
          <div className="alert alert-danger mt-3">{userCreationError}</div>
        )}
      </div>

      {/* Modal de Confirmación */}
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleRegister}
        header="¿Deseas confirmar la acción?"
        loading={userCreationLoading}
      >
        <h6>Resumen de datos ingresados:</h6>
        <ul>
          {/* Generación dinámica del resumen, el equivalente a tu previewHTML */}
          <li>
            <strong>Grado:</strong>{" "}
            {grados.find((g) => g.id === formData.grado)?.descripcion || "N/A"}
          </li>
          <li>
            <strong>Nombre:</strong> {formData.nombre || "N/A"}
          </li>
          <li>
            <strong>Apellido:</strong> {formData.apellido || "N/A"}
          </li>
          <li>
            <strong>Documento:</strong> {formData.documento || "N/A"}
          </li>
          <li>
            <strong>Correo:</strong> {formData.correo || "N/A"}
          </li>
          {formData.rolPlataforma && (
            <li>
              <strong>Rol:</strong>{" "}
              {roles.find((r) => r.id === formData.rolPlataforma)?.nombre_rol ||
                "N/A"}
            </li>
          )}
          {formData.facultad && (
            <li>
              <strong>Facultad:</strong>{" "}
              {facultades.find((f) => f.id === formData.facultad)
                ?.nombre_facultad || "N/A"}
            </li>
          )}
          {/* ... puedes añadir más campos aquí ... */}
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default NewUserModal;
