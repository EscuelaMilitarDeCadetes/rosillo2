import React, { useState } from 'react';
import { Button } from 'primereact/button';
import ConvocatoriaTable from '../components/convocatorias/ConvocatoriaTable';
import NewConvocatoriaModal from '../components/convocatorias/NewConvocatoriaModal';
import ProjectsByConvocatoriaModal from '../components/convocatorias/ProjectsByConvocatoriaModal';

const AdminConvocatoriasPage = () => {
  const [isNewConvocatoriaModalVisible, setIsNewConvocatoriaModalVisible] = useState(false);
  const [isProjectsByConvocatoriaModalVisible, setIsProjectsByConvocatoriaModalVisible] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);

  const handleViewProjects = (convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    setIsProjectsByConvocatoriaModalVisible(true);
  };

  const handleEditConvocatoria = (convocatoria) => {
    // Aquí podrías abrir un modal de edición, similar al de creación
    console.log("Editar Convocatoria:", convocatoria);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-end mb-4">
        <Button label="Nueva Convocatoria" icon="pi pi-plus" onClick={() => setIsNewConvocatoriaModalVisible(true)} />
      </div>

      <div className="card">
        <ConvocatoriaTable 
          onViewProjects={handleViewProjects} 
          onEditConvocatoria={handleEditConvocatoria} 
        />
      </div>

      <NewConvocatoriaModal 
        visible={isNewConvocatoriaModalVisible} 
        onHide={() => setIsNewConvocatoriaModalVisible(false)} 
      />

      <ProjectsByConvocatoriaModal
        visible={isProjectsByConvocatoriaModalVisible}
        onHide={() => setIsProjectsByConvocatoriaModalVisible(false)}
        convocatoria={selectedConvocatoria}
      />
    </div>
  );
};

export default AdminConvocatoriasPage;
