import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { addRoleToUser } from "../../features/usuarios/usersSlice.js";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Modal para agregar un rol de plataforma a un usuario existente.
 *
 * apps/usuarios/views/rol_x_usuario_viewset.py -> @action 'agregar-rol'
 * -> RolXUsuarioService.agregar_rol_a_usuario(usuario_id, rol_id, ejecutor).
 *
 * A diferencia de la versión anterior: se quitaron los campos de Facultad,
 * Grupo y Fecha de Vinculación. El backend real de esta acción SOLO acepta
 * usuario_id y rol_id — no existe tal cosa como "agregar el rol GRUPO con
 * fecha de vinculación X" en este endpoint. Vincular a una persona a un
 * grupo/facultad es un concepto distinto (tabla PersonaXGrupo), que ya
 * cubre AssignResearcherModal.js posteando a institucional/persona-grupo/.
 * La versión anterior mezclaba ambos conceptos y esos campos nunca habrían
 * llegado a ningún lado en el backend real.
 */
const AddRoleModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { usuarios, roles, loading: metadataLoading } = useSelector((state) => state.metadata);
  const { loading: actionLoading, error: actionError } = useSelector((state) => state.usuarios);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedUser(null);
      setSelectedRole(null);
      setValidationError("");
    }
  }, [visible]);

  const validateForm = () => {
    if (!selectedUser || !selectedRole) {
      setValidationError("Debe seleccionar un usuario y un rol.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleShowConfirmation = () => {
    if (!validateForm()) return;
    onHide();
    setIsConfirmVisible(true);
  };

  const handleConfirmAddRole = () => {
    dispatch(addRoleToUser({ usuario_id: selectedUser, rol_id: selectedRole })).then((result) => {
      if (addRoleToUser.fulfilled.match(result)) {
        setIsConfirmVisible(false);
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Agregar Rol" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <Dialog header="Agregar Rol a Usuario" visible={visible} style={{ width: "40vw" }} footer={footer} onHide={onHide}>
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="user">Usuario</label>
          <Dropdown
            inputId="user"
            value={selectedUser}
            options={usuarios}
            onChange={(e) => setSelectedUser(e.value)}
            optionLabel="username"
            optionValue="id"
            filter
            placeholder="Seleccione un usuario"
            loading={metadataLoading}
          />
        </div>
        <div className="field mb-3">
          <label htmlFor="role">Rol en la Plataforma</label>
          <Dropdown
            inputId="role"
            value={selectedRole}
            options={roles}
            onChange={(e) => setSelectedRole(e.value)}
            optionLabel="nombre_rol"
            optionValue="id"
            filter
            placeholder="Seleccione un rol"
            loading={metadataLoading}
          />
        </div>
        {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
        {actionError && (
          <Message
            severity="error"
            className="mt-3 w-full"
            text={typeof actionError === "string" ? actionError : "Error al agregar el rol."}
          />
        )}
      </div>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmAddRole}
        header="¿Deseas confirmar la acción?"
        loading={actionLoading}
      >
        <h6>Resumen de datos ingresados:</h6>
        <ul>
          <li>
            <strong>Usuario:</strong> {usuarios.find((u) => u.id === selectedUser)?.username || "N/A"}
          </li>
          <li>
            <strong>Rol:</strong> {roles.find((r) => r.id === selectedRole)?.nombre_rol || "N/A"}
          </li>
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default AddRoleModal;