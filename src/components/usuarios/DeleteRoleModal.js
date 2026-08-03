import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import {


  fetchRolesForUser,
  deleteRoleFromUser,
} from "../../features/users/usersSlice";
import ConfirmationModal from "../common/ConfirmationModal";

const DeleteRoleModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();

  const { usuarios, loading: metadataLoading } = useSelector(
    (state) => state.metadata
  );
  const {
    userRoles,
    loading: actionLoading,
    error: actionError,
  } = useSelector((state) => state.users);


  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleToDelete, setSelectedRoleToDelete] = useState(null);

  // Estado para el modal de confirmación
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);


  // Limpiar el formulario cuando el modal se cierra
  useEffect(() => {
    if (!visible) {
      setSelectedUser(null);
      setSelectedRoleToDelete(null);
    }
  }, [visible]);


  const handleShowConfirmation = () => {
    // Antes de mostrar la confirmación, oculta el formulario principal
    onHide();
    setIsConfirmVisible(true);
  };

  // Cargar los roles del usuario cuando se selecciona uno
  useEffect(() => {
    if (selectedUser) {
      dispatch(fetchRolesForUser(selectedUser));
      setSelectedRoleToDelete(null); // Limpiar la selección de rol anterior
    }
  }, [selectedUser, dispatch]);

  const handleDelete = () => {
    if (selectedRoleToDelete) {
      dispatch(deleteRoleFromUser(selectedRoleToDelete)).then((result) => {
        if (deleteRoleFromUser.fulfilled.match(result)) {
          setIsConfirmVisible(false); // Cierra el modal de confirmación
        }
      });
    }
  };


  const footer = (
    <div>
      <Button
        label="No"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Borrar Rol"
        icon="pi pi-check"
        onClick={handleShowConfirmation}
        autoFocus
      />
    </div>
  );


  // Formatear las opciones para el dropdown de roles
  const roleOptions = userRoles.map((ur) => ({
    label: ur.rol_details.nombre_rol, // Asumiendo que usas un serializer anidado
    value: ur.id, // El valor es el ID de la relación RolXUsuario, que es lo que queremos borrar
  }));

  return (

    <Dialog
      header="Borrar Rol de Usuario"
      visible={visible}
      style={{ width: "40vw" }}
      footer={footer}
      onHide={onHide}
    >

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
            value={selectedRoleToDelete}
            options={roleOptions}
            onChange={(e) => setSelectedRoleToDelete(e.value)}
            placeholder="Seleccione el rol a borrar"
            disabled={!selectedUser || userRoles.length === 0}
          />
        </div>
        {actionError && (
          <div className="alert alert-danger mt-3">{actionError}</div>
        )}
      </div>

      {/* Modal de Confirmación */}
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleDelete}
        header="¿Deseas confirmar la acción?"
        loading={actionLoading}
      >

        <p>
          ¿Estás seguro de que quieres borrar este rol del usuario?
        </p>
      </ConfirmationModal>
    </Dialog>
  );
};

export default DeleteRoleModal;
