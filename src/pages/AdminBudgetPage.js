import React, { useState } from 'react';
import BudgetTable from '../components/budgets/BudgetTable';
import EditBudgetModal from '../components/budgets/EditBudgetModal';

const AdminBudgetPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMonto, setSelectedMonto] = useState(null);

  const handleEditBudget = (monto) => {
    setSelectedMonto(monto);
    setIsModalVisible(true);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <BudgetTable onEditBudget={handleEditBudget} />
      </div>
      <EditBudgetModal visible={isModalVisible} onHide={() => setIsModalVisible(false)} monto={selectedMonto} />
    </div>
  );
};

export default AdminBudgetPage;
