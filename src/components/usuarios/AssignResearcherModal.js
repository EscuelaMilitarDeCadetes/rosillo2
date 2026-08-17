import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Message } from "primereact/message";
import { assignResearcher } from "../../features/usuarios/usersSlice.js";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Modal para vincular una Persona a un Grupo de Investigación (crea un
 * PersonaXGrupo).
 *
 * apps/institucional/views/persona_x_grupo_viewset.py -> create() ->
 * PersonaXGrupoService.crear(persona_id, rol_grupo_id, ejecutor, grupo_id,
 * facultad_id, vinculacion). Las claves del body van SIN sufijo "_id"
 * (persona, rol_grupo, grupo, facultad, vinculacion) — eso ya estaba bien
 * en la versión anterior.
 *
 * Lo que SÍ estaba roto:
 *  - El Dropdown de "Persona" armaba sus opciones con `value: u.persona`,
 *    pero UsuarioSerializer no expone ningún campo `persona` (un Usuario no
 *    tiene una Persona fija: es una relación histórica vía UsuarioXPersona).
 *    Ese id siempre era `undefined`. Ahora se usa la lista real de
 *    apps/institucional/serializers/persona_serializer.py (PersonaSerializer,
 *    campos: id, nombre, apellido, documento, correo, grado, grado_sigla,
 *    cvlac), cargada en metadataSlice como `personas`.
 *  - `vinculacion` SÍ es obligatoria aquí (PersonaXGrupoValidator
 *    ._validar_vinculacion lanza error si falta) — a diferencia del flujo de
 *    creación de usuario nuevo (VinculacionService), que la fija sola a hoy.
 *    Se mantiene el campo tal cual estaba.
 *  - Se agregó un campo opcional de Facultad: si `grupo` se envía sin
 *    `facultad`, el backend exige que la persona YA tenga una vinculación de
 *    facultad activa (PersonaXGrupoValidator
 *    ._validar_correspondencia_grupo_facultad) o falla con un mensaje claro.
 *    Enviar `facultad` explícitamente evita ese error en el caso común de
 *    vincular a alguien por primera vez.
 *  - `estado: true` se quitó del payload: create() no lee esa clave (el
 *    modelo ya default-ea estado=True), así que no hacía nada.
 */
const AssignResearcherModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { personas, rolesGrupo, grupos, facultades, loading: metadataLoading } = useSelector(
    (state) => state.metadata
  );
  const { loading: actionLoading, error: actionError } = useSelector((state) => state.usuarios);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [vinculacionDate, setVinculacionDate] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedPerson(null);
      setSelectedRole(null);
      setSelectedGroup(null);
      setSelectedFaculty(null);
      setVinculacionDate(null);
      setValidationError("");
    }
  }, [visible]);

  const validarFormulario = () => {
    if (!selectedPerson || !selectedRole || !vinculacionDate) {
      setValidationError("Debe seleccionar una persona, un rol y la fecha de vinculación.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleShowConfirmation = () => {
    if (!validarFormulario()) return;
    onHide();
    setIsConfirmVisible(true);
  };

  const handleAssign = () => {
    const formattedDate = vinculacionDate ? vinculacionDate.toISOString().split("T")[0] : null;
    const payload = {
      persona: selectedPerson,
      rol_grupo: selectedRole,
      vinculacion: formattedDate,
    };
    if (selectedGroup) payload.grupo = selectedGroup;
    if (selectedFaculty) payload.facultad = selectedFaculty;

    dispatch(assignResearcher(payload)).then((result) => {
      if (assignResearcher.fulfilled.match(result)) {
        setIsConfirmVisible(false);
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Registrar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <Dialog header="Asignar Investigador a Grupo" visible={visible} style={{ width: "40vw" }} footer={footer} onHide={onHide}>
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="person">Persona</label>
          <Dropdown
            inputId="person"
            value={selectedPerson}
            options={personas}
            onChange={(e) => setSelectedPerson(e.value)}
            optionLabel="correo"
            optionValue="id"
            filter
            placeholder="Seleccione una persona por su correo"
            loading={metadataLoading}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="role">Rol en el Equipo</label>
          <Dropdown
            inputId="role"
            value={selectedRole}
            options={rolesGrupo}
            onChange={(e) => setSelectedRole(e.value)}
            optionLabel="cargo"
            optionValue="id"
            filter
            placeholder="Seleccione un rol"
            loading={metadataLoading}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="group">Grupo de Investigación (opcional)</label>
          <Dropdown
            inputId="group"
            value={selectedGroup}
            options={grupos}
            onChange={(e) => setSelectedGroup(e.value)}
            optionLabel="nombre_grupo"
            optionValue="id"
            filter
            showClear
            placeholder="Seleccione un grupo"
            loading={metadataLoading}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="faculty">Facultad (opcional)</label>
          <Dropdown
            inputId="faculty"
            value={selectedFaculty}
            options={facultades}
            onChange={(e) => setSelectedFaculty(e.value)}
            optionLabel="nombre_facultad"
            optionValue="id"
            filter
            showClear
            placeholder="Seleccione una facultad"
            loading={metadataLoading}
          />
          <small className="text-color-secondary">
            Solo necesaria si la persona todavía no tiene una vinculación de facultad activa.
          </small>
        </div>
        <div className="field mb-3">
          <label htmlFor="vinculacion">Fecha de Vinculación</label>
          <Calendar
            inputId="vinculacion"
            value={vinculacionDate}
            onChange={(e) => setVinculacionDate(e.value)}
            dateFormat="yy-mm-dd"
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {actionError && (
          <Message
            severity="error"
            className="mt-3 w-full"
            text={typeof actionError === "string" ? actionError : "Error al asignar el investigador."}
          />
        )}
      </div>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleAssign}
        header="¿Deseas confirmar la acción?"
        loading={actionLoading}
      >
        <ul>
          <li><strong>Persona:</strong> {personas.find((p) => p.id === selectedPerson)?.correo || "N/A"}</li>
          <li><strong>Rol en el equipo:</strong> {rolesGrupo.find((r) => r.id === selectedRole)?.cargo || "N/A"}</li>
          {selectedGroup && (
            <li><strong>Grupo:</strong> {grupos.find((g) => g.id === selectedGroup)?.nombre_grupo || "N/A"}</li>
          )}
          {selectedFaculty && (
            <li><strong>Facultad:</strong> {facultades.find((f) => f.id === selectedFaculty)?.nombre_facultad || "N/A"}</li>
          )}
          <li><strong>Fecha de vinculación:</strong> {vinculacionDate?.toLocaleDateString() || "N/A"}</li>
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default AssignResearcherModal;