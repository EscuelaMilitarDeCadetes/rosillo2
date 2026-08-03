import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { addRoleToUser } from '../../features/users/usersSlice';
import ConfirmationModal from '../common/ConfirmationModal';

const AddRoleModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  // Obtener todos los datos necesarios del store de metadata
  const {
    usuarios,
    roles,
    rolesGrupo, // Aunque no se usa directamente aquí, es bueno tenerlo si se necesitara
    facultades,
    grupos,
    loading: metadataLoading,
  } = useSelector((state) => state.metadata);
  const { loading: actionLoading, error: actionError } = useSelector(
    (state) => state.users
  );

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [vinculacionDate, setVinculacionDate] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Estados para controlar la visibilidad de los campos condicionales
  const [showFaculty, setShowFaculty] = useState(false);
  const [showGroup, setShowGroup] = useState(false);

  // Estado para el modal de confirmación
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  // Limpiar el formulario cuando el modal se cierra
  useEffect(() => {
    if (!visible) {
      setSelectedUser(null);
      setSelectedRole(null);
      setSelectedFaculty(null);
      setSelectedGroup(null);
      setVinculacionDate(null);
      setShowFaculty(false);
      setShowGroup(false);
    }
  }, [visible]);

  // Lógica para mostrar/ocultar campos cuando cambia el rol seleccionado
  useEffect(() => {
    // Asumimos que los roles de Facultad y Grupo tienen nombres específicos o IDs conocidos.
    // Aquí usamos nombres para que sea más legible.
    const role = roles.find((r) => r.id === selectedRole);
    if (role) {
      // Asumiendo que los roles de facultad y grupo tienen IDs 5 y 6 respectivamente,
      // como se infiere de tu código Thymeleaf original (ddlRol.value==5, ddlRol.value==6)
      setShowFaculty(role.id === 5); // ID para ROLE_FACULTADES
      setShowGroup(role.id === 6); // ID para ROLE_GRUPOS
    } else {
      setShowFaculty(false);
      setShowGroup(false);
    }
  }, [selectedRole, roles]);

  // Validar antes de mostrar la confirmación
  const validateForm = () => {
    if (!selectedUser || !selectedRole) {
      setValidationError('Debe seleccionar un usuario y un rol.');
      return false;
    }
    if (showFaculty && !selectedFaculty) {
      setValidationError('Debe seleccionar una facultad.'); return false;
    }
    if (showGroup && !selectedGroup) {
      setValidationError('Debe seleccionar un grupo de investigación.'); return false;
    }
    return true;
  };

  const handleShowConfirmation = () => {
    // Antes de mostrar la confirmación, oculta el formulario principal
    onHide();
    setIsConfirmVisible(true);
  };

  const handleConfirmAddRole = () => {
    if (!validateForm()) {
      setIsConfirmVisible(false); // Oculta la confirmación si la validación falla
      return;
    }

    // Formatear la fecha a YYYY-MM-DD si es necesario
    const formattedDate = vinculacionDate ? vinculacionDate.toISOString().split('T')[0] : null;

    const payload = {
      usuario: selectedUser,
      rol: selectedRole,
      ...(showFaculty && { facultad: selectedFaculty }), // Incluir solo si aplica
      ...(showGroup && { grupo: selectedGroup }),       // Incluir solo si aplica
      ...((showFaculty || showGroup) && { vinculacion: formattedDate }), // Incluir solo si aplica
      estado: true, // Asumimos que el rol se agrega como activo
    };

    dispatch(addRoleToUser(payload)).then((result) => {
      if (addRoleToUser.fulfilled.match(result)) {
        setIsConfirmVisible(false); // Cierra el modal de confirmación
      }
    });
  };

  const handleAddRole = () => {
    if (validateForm()) {
      handleShowConfirmation();
    }
  };

  const footer = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Agregar Rol"
        icon="pi pi-check"
        onClick={handleShowConfirmation}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header="Agregar Rol a Usuario"
      visible={visible}
      style={{ width: "40vw" }}
      footer={footer}
      onHide={onHide}
    >
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

        {/* Campos Condicionales */}
        {showFaculty && (
          <div className="field mb-3">
            <label htmlFor="faculty">Facultad</label>
            <Dropdown
              inputId="faculty"
              value={selectedFaculty}
              options={facultades}
              onChange={(e) => setSelectedFaculty(e.value)}
              optionLabel="nombre_facultad"
              optionValue="id"
              filter
              placeholder="Seleccione una facultad"
              loading={metadataLoading}
            />
          </div>
        )}
        {showGroup && (
          <div className="field mb-3">
            <label htmlFor="group">Grupo de Investigación</label>
            <Dropdown
              inputId="group"
              value={selectedGroup}
              options={grupos}
              onChange={(e) => setSelectedGroup(e.value)}
              optionLabel="nombre_grupo"
              optionValue="id"
              filter
              placeholder="Seleccione un grupo"
              loading={metadataLoading}
            />
          </div>
        )}
        {(showFaculty || showGroup) && (
          <div className="field mb-3">
            <label htmlFor="vinculacion">Fecha de Vinculación</label>
            <Calendar
              inputId="vinculacion"
              value={vinculacionDate}
              onChange={(e) => setVinculacionDate(e.value)}
              dateFormat="yy-mm-dd"
            />
          </div>
        )}

        {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
        {actionError && (
          <div className="alert alert-danger mt-3">{actionError}</div>
        )}
      </div>
      {/* Modal de Confirmación */}
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => {
          setIsConfirmVisible(false);
          // Si el modal principal ya se ocultó, podrías querer mostrarlo de nuevo aquí
          // para que el usuario pueda corregir el formulario.
          // O simplemente dejar que el usuario cierre el modal de confirmación y luego el principal.
        }}
        onConfirm={handleConfirmAddRole} // Llama a la función que despacha la acción
        header="¿Deseas confirmar la acción?"
        loading={actionLoading}
      >
        <h6>Resumen de datos ingresados:</h6>
        <ul>          
          <li>
            <strong>Usuario:</strong>{" "}
            {usuarios.find((u) => u.id === selectedUser)?.username || "N/A"}
          </li>
          <li>
            <strong>Rol:</strong>{" "}
            {roles.find((r) => r.id === selectedRole)?.nombre_rol || "N/A"} (ID: {selectedRole})
          </li>
          {showFaculty && (
            <li>
              <strong>Facultad:</strong>{" "}
              {facultades.find((f) => f.id === selectedFaculty)?.nombre_facultad || "N/A"} (ID: {selectedFaculty})
            </li>
          )}
          {showGroup && (
            <li>
              <strong>Grupo:</strong>{" "}              
              {grupos.find((g) => g.id === selectedGroup)?.nombre_grupo || "N/A"} (ID: {selectedGroup})
            </li>
          )}
          {(showFaculty || showGroup) && vinculacionDate && (
            <li>
              <strong>Fecha de Vinculación:</strong> {vinculacionDate.toLocaleDateString()}
            </li>
          )}
        </ul>
      </ConfirmationModal>
    </Dialog>
  );
};

export default AddRoleModal;
