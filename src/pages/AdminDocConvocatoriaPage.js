import React, { useState } from 'react';
import { Button } from 'primereact/button';
import DocConvocatoriaTable from '../components/convocatorias/DocConvocatoriaTable';
import NewDocConvocatoriaModal from '../components/convocatorias/NewDocConvocatoriaModal';

const AdminDocConvocatoriaPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-end mb-4">
        <Button label="Agregar Documento" icon="pi pi-plus" onClick={() => setIsModalVisible(true)} />
      </div>

      <div className="card">
        <DocConvocatoriaTable />
      </div>

      <NewDocConvocatoriaModal 
        visible={isModalVisible} 
        onHide={() => setIsModalVisible(false)} 
      />
    </div>
  );
};

export default AdminDocConvocatoriaPage;
