import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { fetchRolesForUser, deleteRoleFromUser } from "../../features/usuarios/usersSlice.js";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Modal para quitarle un rol de plataforma a un usuario.
 *
 * apps/usuarios/views/rol_x_usuario_viewset.py -> @action 'borrar-rol'
 * -> RolXUsuarioService.borrar_rol_de_usuario(usuario_id, rol_id, ejecutor).
 * Identifica la relación por el PAR (usuario_id, rol_id) — no existe una
 * ruta para borrar por el id de la fila RolXUsuario. Por eso el Dropdown de
 * "rol a borrar" ahora usa como value el id de RolPlataforma (`ur.rol`), no
 * el id de la relación (`ur.id`) como hacía la versión anterior.
 *
 * fetchRolesForUser devuelve objetos planos de RolXUsuarioSerializer
 * ({id, usuario, rol, estado, usuario_nombre, rol_nombre}) — no el
 * `ur.rol_details.nombre_rol` anidado que asumía el código original, que
 * nunca existió en el serializer real.
 */
const DeleteRoleModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { usuarios, loading: metadataLoading } = useSelector((state) => state.metadata);
  const { userRoles, loading: actionLoading, error: actionError } = useSelector((state) => state.usuarios);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRolId, setSelectedRolId] = useState(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedUser(null);
      setSelectedRolId(null);
    }
  }, [visible]);

  useEffect(() => {
    if (selectedUser) {
      dispatch(fetchRolesForUser(selectedUser));
      setSelectedRolId(null);
    }
  }, [selectedUser, dispatch]);

  const handleShowConfirmation = () => {
    if (!selectedUser || !selectedRolId) return;
    onHide();
    setIsConfirmVisible(true);
  };

  const handleDelete = () => {
    dispatch(deleteRoleFromUser({ usuario_id: selectedUser, rol_id: selectedRolId })).then((result) => {
      if (deleteRoleFromUser.fulfilled.match(result)) {
        setIsConfirmVisible(false);
      }
    });
  };

  const footer = (
    <div>
      <Button label="No" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Borrar Rol" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus disabled={!selectedUser || !selectedRolId} />
    </div>
  );

  // value = id de RolPlataforma (ur.rol), que es lo que exige borrar-rol
  const roleOptions = userRoles.map((ur) => ({
    label: ur.rol_nombre,
    value: ur.rol,
  }));

  const nombreRolSeleccionado = userRoles.find((ur) => ur.rol === selectedRolId)?.rol_nombre;
  const nombreUsuarioSeleccionado = usuarios.find((u) => u.id === selectedUser)?.username;

  return (
    <Dialog header="Borrar Rol de Usuario" visible={visible} style={{ width: "40vw" }} footer={footer} onHide={onHide}>
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="user-to-delete-from">Usuario</label>
          <Dropdown
            inputId="user-to-delete-from"
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
          <label htmlFor="role-to-delete">Rol en la Plataforma</label>
          <Dropdown
            inputId="role-to-delete"
            value={selectedRolId}
            options={roleOptions}
            onChange={(e) => setSelectedRolId(e.value)}
            placeholder={
              selectedUser && userRoles.length === 0
                ? "Este usuario no tiene roles activos"
                : "Seleccione el rol a borrar"
            }
            disabled={!selectedUser || userRoles.length === 0}
          />
        </div>
        {actionError && (
          <Message
            severity="error"
            className="mt-3 w-full"
            text={typeof actionError === "string" ? actionError : "Error al borrar el rol."}
          />
        )}
      </div>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleDelete}
        header="¿Deseas confirmar la acción?"
        loading={actionLoading}
      >
        <p>
          ¿Estás seguro de que quieres quitarle el rol <strong>{nombreRolSeleccionado || "N/A"}</strong> al usuario{" "}
          <strong>{nombreUsuarioSeleccionado || "N/A"}</strong>?
        </p>
      </ConfirmationModal>
    </Dialog>
  );
};

export default DeleteRoleModal;