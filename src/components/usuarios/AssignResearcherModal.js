import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { assignResearcher } from "../../features/users/usersSlice";
import ConfirmationModal from "../common/ConfirmationModal";

const AssignResearcherModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();

  const {
    usuarios,
    rolesGrupo,
    grupos,
    loading: metadataLoading,
  } = useSelector((state) => state.metadata);
  const { loading: actionLoading, error: actionError } = useSelector(
    (state) => state.users
  );

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [vinculacionDate, setVinculacionDate] = useState(null);

  // Estado para el modal de confirmación
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);


  // Limpiar el formulario cuando el modal se cierra
  useEffect(() => {
    if (!visible) {
      setSelectedPerson(null);
      setSelectedRole(null);
      setSelectedGroup(null);
      setVinculacionDate(null);
    }
  }, [visible]);


  const handleShowConfirmation = () => {
    // Antes de mostrar la confirmación, oculta el formulario principal
    onHide();
    setIsConfirmVisible(true);
  };

  const handleAssign = () => {

    // Formatear la fecha a YYYY-MM-DD si es necesario
    const formattedDate = vinculacionDate
      ? vinculacionDate.toISOString().split("T")[0]
      : null;

    const payload = {
      persona: selectedPerson,
      rol_grupo: selectedRole,
      grupo: selectedGroup,
      vinculacion: formattedDate,
      estado: true, // Por defecto, se asigna como activo
    };

    dispatch(assignResearcher(payload)).then((result) => {
      if (assignResearcher.fulfilled.match(result)) {
        setIsConfirmVisible(false); // Cierra el modal de confirmación
      }
    });
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

        label="Registrar"
        icon="pi pi-check"
        onClick={handleShowConfirmation}
        autoFocus
      />
    </div>
  );

  // El dropdown de personas en Thymeleaf usa el correo, así que replicamos eso.

  // `usuarios` tiene `username` que es el correo.
  const personOptions = usuarios.map((u) => ({
    label: u.username,
    value: u.persona,
  }));

  return (
    <Dialog
      header="Asignar Investigador a Grupo"
      visible={visible}
      style={{ width: "40vw" }}
      footer={footer}
      onHide={onHide}
    >

      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="person">Persona</label>
          <Dropdown
            inputId="person"
            value={selectedPerson}
            options={personOptions}
            onChange={(e) => setSelectedPerson(e.value)}
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
        <div className="field mb-3">
          <label htmlFor="vinculacion">Fecha de Vinculación</label>
          <Calendar
            inputId="vinculacion"
            value={vinculacionDate}
            onChange={(e) => setVinculacionDate(e.value)}
            dateFormat="yy-mm-dd"
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
        onConfirm={handleAssign}
        header="¿Deseas confirmar la acción?"
        loading={actionLoading}
      >
        <p>¿Confirma la asignación del investigador?</p>
      </ConfirmationModal>
    </Dialog>
  );
};
