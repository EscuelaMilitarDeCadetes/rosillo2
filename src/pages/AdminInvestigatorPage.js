import React from 'react';
import InvestigatorProjectTable from '../components/investigators/InvestigatorProjectTable';

const AdminInvestigatorPage = () => {
  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <InvestigatorProjectTable />
      </div>
    </div>
  );
};

export default AdminInvestigatorPage;
