// src/domains/usuarios/pages/UsuarioAdminPage.js
import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import UsuarioAdminTable from '../../../components/usuarioAdmin/UsuarioAdminTable';
import UsuariosInactivosTable from '../../../components/usuarioAdmin/UsuariosInactivosTable';
import AdminDashboardPanel from '../../../components/usuarioAdmin/AdminDashboardPanel';

const UsuarioAdminPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="container-fluid mt-4">
      <div className="card p-3">
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header="Dashboard">
            <AdminDashboardPanel />
          </TabPanel>
          <TabPanel header="Todos los usuarios">
            <UsuarioAdminTable />
          </TabPanel>
          <TabPanel header="Inactivos">
            <UsuariosInactivosTable />
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default UsuarioAdminPage;