import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInvestigadoresPorProyecto } from '../../features/proyectos/projectsSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import AddInvestigadorProyectoModal from './AddInvestigadorProyectoModal'; // Nuevo modal
import RegisterInvestigatorModal from './RegisterInvestigatorModal'; // Nuevo modal
import ConfirmationModal from '../common/ConfirmationModal';
import { deleteInvestigadorProyecto } from '../../features/proyectos/projectsSlice';




  const hasAnyRole = (requiredRoles) => {
    const { roles } = useSelector((state) => state.auth);
    return requiredRoles.some(role => roles.includes(role));
  };

  const [isAddInvestigatorModalVisible, setIsAddInvestigatorModalVisible] = useState(false);
  const [isRegisterNewInvestigatorModalVisible, setIsRegisterNewInvestigatorModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [investigatorToDelete, setInvestigatorToDelete] = useState(null);

  const handleDeleteClick = (investigator) => {
    setInvestigatorToDelete(investigator);
    setIsDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    if (investigatorToDelete) {
      dispatch(deleteInvestigadorProyecto(investigatorToDelete.id)).then(() => setIsDeleteConfirmVisible(false));
    }
  };

  const actionBodyTemplate = (rowData) => {
    const canModify = hasAnyRole(['ROLE_CINTERNOS', 'ROLE_CEXTERNOS']);
    return (
      <div className="d-flex gap-2">
        {canModify && <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" tooltip="Borrar Investigador" onClick={() => handleDeleteClick(rowData)} />}
      </div>
    );
  };

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        {hasAnyRole(['ROLE_CINTERNOS', 'ROLE_CEXTERNOS']) && (
          <Button label="Agregar Investigador" icon="pi pi-plus" onClick={() => setIsAddInvestigatorModalVisible(true)} />
        )}
      </div>
      <DataTable
        value={investigadores}
        header={header}
        loading={loading}
        paginator
        rows={10}
        globalFilter={globalFilter}
        emptyMessage="No hay investigadores asignados a este proyecto."
        responsiveLayout="scroll"
      >
        <Column field="persona_x_grupo_details.persona_details.nombre" header="Nombre" sortable />
        <Column field="persona_x_grupo_details.persona_details.apellido" header="Apellido" sortable />
        <Column field="rol_investigador_details.nombre_rol_investigador" header="Rol" sortable />
        <Column header="Acciones" body={actionBodyTemplate} />
      </DataTable>

      <AddInvestigadorProyectoModal
        visible={isAddInvestigatorModalVisible}
        onHide={() => setIsAddInvestigatorModalVisible(false)}
        proyectoId={proyectoId}
        onRegisterNewInvestigator={() => setIsRegisterNewInvestigatorModalVisible(true)}
      />

      <RegisterInvestigatorModal
        visible={isRegisterNewInvestigatorModalVisible}
        onHide={() => setIsRegisterNewInvestigatorModalVisible(false)}
        proyectoId={proyectoId}
      />

      <ConfirmationModal
        visible={isDeleteConfirmVisible}
        onHide={() => setIsDeleteConfirmVisible(false)}
        onConfirm={handleConfirmDelete}
        header="Confirmar Eliminación"
        loading={loading}
      >
        <p>¿Estás seguro de que quieres borrar al investigador <strong>{investigatorToDelete?.persona_x_grupo_details?.persona_details?.nombre} {investigatorToDelete?.persona_x_grupo_details?.persona_details?.apellido}</strong> del proyecto?</p>
      </ConfirmationModal>
    </>
  );

export default InvestigadoresTable;
