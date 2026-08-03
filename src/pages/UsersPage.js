import React, { useState } from 'react';
import { Button } from 'primereact/button';
import PlatformUsersTable from '../components/users/PlatformUsersTable';
import NewUserModal from '../components/users/NewUserModal';
import GroupUsersTable from '../components/users/GroupUsersTable';
import AddRoleModal from '../components/users/AddRoleModal';
import AssignResearcherModal from '../components/users/AssignResearcherModal';
import DeleteRoleModal from '../components/users/DeleteRoleModal';
import { useSelector } from 'react-redux';

const UsersPage = () => {
  const [isNewUserModalVisible, setIsNewUserModalVisible] = useState(false);
  const [isAddRoleModalVisible, setIsAddRoleModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isDeleteRoleModalVisible, setIsDeleteRoleModalVisible] = useState(false);
  
  // Estado para pasar datos a los modales
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Obtener datos para los dropdowns de los modales
  const { roles } = useSelector((state) => state.metadata);

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
        {/* El botón de "Nuevo Usuario" abre el modal correspondiente */}
        <Button label="Nuevo Usuario" icon="pi pi-user-plus" onClick={() => setIsNewUserModalVisible(true)} />
        <Button label="Agregar Rol" icon="pi pi-plus-circle" className="p-button-info" onClick={() => setIsAddRoleModalVisible(true)} />
        <Button label="Asignar Investigador" icon="pi pi-sitemap" className="p-button-success" onClick={() => setIsAssignModalVisible(true)} />
        <Button label="Borrar Rol" icon="pi pi-user-minus" className="p-button-danger" onClick={() => setIsDeleteRoleModalVisible(true)} />
      </div>

      <div className="card mb-4">
        <PlatformUsersTable />
      </div>

      <div className="card">
        {/* Integración del nuevo componente de tabla */}
        <GroupUsersTable />
      </div>

      {/* Renderizado de Modales */}
      <NewUserModal 
        visible={isNewUserModalVisible} 
        onHide={() => setIsNewUserModalVisible(false)} 
      />
      <AddRoleModal
        visible={isAddRoleModalVisible}
        onHide={() => setIsAddRoleModalVisible(false)}
        user={selectedItem} // Necesitarías una forma de seleccionar un usuario de la tabla
        roles={roles}
      />
      <AssignResearcherModal
        visible={isAssignModalVisible}
        onHide={() => setIsAssignModalVisible(false)}
      />
      <DeleteRoleModal
        visible={isDeleteRoleModalVisible}
        onHide={() => setIsDeleteRoleModalVisible(false)}
        item={selectedItem} // Necesitarías una forma de seleccionar una fila de la tabla
      />
    </div>
  );
};

export default UsersPage;
