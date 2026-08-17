import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductosPorProyecto, deleteProductoProyecto, uploadProductoToGruplac } from '../../features/proyectos/projectsSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import AddProductoProyectoModal from './AddProductoProyectoModal'; // Nuevo modal
import ConfirmationModal from '../common/ConfirmationModal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082/api/';




  const entregadoBodyTemplate = (rowData) => {
    return <Tag value={rowData.entregado ? 'SI' : 'NO'} severity={rowData.entregado ? 'success' : 'warning'} />;
  };

  const gruplacBodyTemplate = (rowData) => {
    return <Tag value={rowData.gruplac ? 'SI' : 'NO'} severity={rowData.gruplac ? 'success' : 'warning'} />;
  };

  const actionBodyTemplate = (rowData) => {
    const canModify = hasAnyRole(['ROLE_CINTERNOS', 'ROLE_CEXTERNOS']);
    return (
      <div className="d-flex gap-2">
        {rowData.documento && (
          <Button icon="pi pi-download" className="p-button-rounded p-button-info p-button-sm" tooltip="Descargar" onClick={() => window.open(`${API_BASE_URL}productos-x-proyecto/${rowData.id}/download/`, '_blank')} />
        )}
        {canModify && (
          <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" tooltip="Borrar Producto" onClick={() => handleDeleteClick(rowData)} />
        )}
        {canModify && !rowData.gruplac && rowData.entregado && (
          <Button label="Subir a GrupLAC" className="p-button-sm p-button-secondary" onClick={() => handleUploadToGruplac(rowData.id)} />
        )}
        {rowData.gruplac && rowData.entregado && (
          <p className="fw-bold text-success">Producto Subido a GrupLAC</p>
        )}
      </div>
    );
  };

  const [isAddProductModalVisible, setIsAddProductModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      dispatch(deleteProductoProyecto(productToDelete.id)).then(() => setIsDeleteConfirmVisible(false));
    }
  };

  const handleUploadToGruplac = (productId) => {
    dispatch(uploadProductoToGruplac(productId));
  };

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        {hasAnyRole(['ROLE_CINTERNOS', 'ROLE_CEXTERNOS']) && (
          <Button label="Agregar Producto" icon="pi pi-plus" onClick={() => setIsAddProductModalVisible(true)} />
        )}
      </div>
      <DataTable
        value={productos}
        header={header}
        loading={loading}
        paginator
        rows={10}
        globalFilter={globalFilter}
        emptyMessage="No hay productos asociados a este proyecto."
        responsiveLayout="scroll"
      >
        <Column field="producto_x_grupo_details.producto_minciencias_details.nombre_producto" header="Producto" sortable />
        <Column field="categoria" header="Categoría" sortable />
        <Column field="puntaje" header="Puntaje" sortable />
        <Column field="entregado" header="Entregado" body={entregadoBodyTemplate} sortable />
        <Column field="gruplac" header="GrupLAC" body={gruplacBodyTemplate} sortable />
        <Column header="Acciones" body={actionBodyTemplate} />
      </DataTable>

      <AddProductoProyectoModal
        visible={isAddProductModalVisible}
        onHide={() => setIsAddProductModalVisible(false)}
        proyectoId={proyectoId}
      />

      <ConfirmationModal
        visible={isDeleteConfirmVisible}
        onHide={() => setIsDeleteConfirmVisible(false)}
        onConfirm={handleConfirmDelete}
        header="Confirmar Eliminación"
        loading={loading}
      >
        <p>¿Estás seguro de que quieres borrar el producto <strong>{productToDelete?.producto_x_grupo_details?.producto_minciencias_details?.nombre_producto}</strong>?</p>
      </ConfirmationModal>
    </>
  );

export default ProductosTable;
