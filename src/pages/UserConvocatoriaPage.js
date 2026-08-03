import React from 'react';
import ConvocatoriasAbiertasTable from '../components/convocatorias/ConvocatoriasAbiertasTable';
import ProyectosUsuarioTable from '../components/convocatorias/ProyectosUsuarioTable';

const UserConvocatoriaPage = () => {
  return (
    <div className="container-fluid mt-4">
      <div className="card mb-4">
        <ConvocatoriasAbiertasTable />
      </div>
      <div className="card">
        <ProyectosUsuarioTable />
      </div>
    </div>
  );
};

export default UserConvocatoriaPage;
