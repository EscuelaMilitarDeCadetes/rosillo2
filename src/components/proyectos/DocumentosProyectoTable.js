import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDocumentosPorProyecto, deleteDocumentoProyecto } from '../../features/proyectos/projectsSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import AddDocumentoProyectoModal from './AddDocumentoProyectoModal'; // Nuevo modal
import ConfirmationModal from '../common/ConfirmationModal';

const API_BASE_URL = 'http://localhost:8082/api/'; // Asegúrate de que este sea el puerto de tu backend Django

const DocumentosTable = ({ proyectoId }) => {
  const dispatch = useDispatch();
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    if (proyectoId) {
      dispatch(fetchDocumentosPorProyecto(proyectoId));
    }
  }, [dispatch, proyectoId]);

  // Lógica para el listado completo de documentos requeridos
  const allRequiredDocs = [
    "Propuesta del Proyecto", "Carta de Presentación", "Documento de Alianza", "Acta de Inicio",
    "Acta de Seguimiento", "Control de cambios", "Informe final", "Entregables",
    "Compromisos de confidencialidad", "Cesion de derechos", "Soportes presupuestales",
    "Acta comite local", "Busqueda tecnologica", "Matricula", "Disclosure",
    "Comunicaciones oficiales", "Proceso contractual", "Comite funcional",
    "Convenio", "Comite de etica", "Acta de cierre"
  ];

  // Combinar documentos existentes con los requeridos para mostrar el estado
  const combinedDocuments = allRequiredDocs.map(requiredDocName => {
    const existingDoc = documentos.find(doc => doc.tipo_documento_details?.nombre_documento === requiredDocName);
    return existingDoc || {
      id: null, // No hay ID si no existe
      proyecto: proyectoId,
      tipo_documento_details: { nombre_documento: requiredDocName },
      documento: null,
      estado: 'PENDIENTE',
      is_required: true, // Marcar como requerido para la UI
    };
  });

  const [isAddDocModalVisible, setIsAddDocModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const hasAnyRole = (requiredRoles) => {
    const { roles } = useSelector((state) => state.auth);
    return requiredRoles.some(role => roles.includes(role));
  };

  const handleDownload = (doc) => {
    if (doc.documento) {
      window.open(`${API_BASE_URL}documentos-x-proyecto/${doc.id}/download/`, '_blank');
    }
  };

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setIsDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    if (docToDelete) {
      dispatch(deleteDocumentoProyecto(docToDelete.id)).then((result) => {
        if (deleteDocumentoProyecto.fulfilled.match(result)) {
          setIsDeleteConfirmVisible(false);
          setDocToDelete(null);
        }
      });
    }
  };

  const statusBodyTemplate = (rowData) => {
    let severity;
    switch (rowData.estado) {
      case 'ENTREGADO': severity = 'info'; break;
      case 'APROBADO': severity = 'success'; break;
      case 'RECHAZADO': severity = 'danger'; break;
      case 'PENDIENTE': severity = 'warning'; break;
      default: severity = 'secondary'; break;
    }
    return <Tag value={rowData.estado} severity={severity} />;
  };

  const actionBodyTemplate = (rowData) => {
    const canModify = hasAnyRole(['ROLE_CINTERNOS', 'ROLE_CEXTERNOS']);
    return (
      <div className="d-flex gap-2">
        {rowData.documento && (
          <Button icon="pi pi-download" className="p-button-rounded p-button-info p-button-sm" tooltip="Descargar" onClick={() => handleDownload(rowData)} />
        )}
        {canModify && rowData.id && ( // Solo se puede borrar si ya existe y el usuario tiene rol
          <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" tooltip="Borrar" onClick={() => handleDeleteClick(rowData)} />
        )}
        {canModify && !rowData.documento && ( // Botón para subir si no hay documento y el usuario tiene rol
          <Button icon="pi pi-upload" className="p-button-rounded p-button-secondary p-button-sm" tooltip="Subir Documento" onClick={() => setIsAddDocModalVisible(true)} />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        {hasAnyRole(['ROLE_CINTERNOS', 'ROLE_CEXTERNOS']) && (
          <Button label="Agregar Documento" icon="pi pi-plus" onClick={() => setIsAddDocModalVisible(true)} />
        )}
      </div>
      <DataTable
        value={combinedDocuments} // Usamos los documentos combinados
        header={header}
        loading={loading}
        paginator
        rows={10}
        globalFilter={globalFilter}
        emptyMessage="No hay documentos asociados a este proyecto."
        responsiveLayout="scroll"
      >
        <Column field="tipo_documento_details.nombre_documento" header="Tipo de Documento" sortable />
        <Column field="documento" header="Nombre del Archivo" sortable />
        <Column field="estado" header="Estado" body={statusBodyTemplate} sortable />
        <Column header="Acciones" body={actionBodyTemplate} />
      </DataTable>

      <AddDocumentoProyectoModal
        visible={isAddDocModalVisible}
        onHide={() => setIsAddDocModalVisible(false)}
        proyectoId={proyectoId}
      />

      <ConfirmationModal
        visible={isDeleteConfirmVisible}
        onHide={() => setIsDeleteConfirmVisible(false)}
        onConfirm={handleConfirmDelete}
        header="Confirmar Eliminación"
        loading={loading}
      >
        <p>¿Estás seguro de que quieres borrar el documento <strong>{docToDelete?.tipo_documento_details?.nombre_documento}</strong>?</p>
      </ConfirmationModal>
    </>
  );
};

export default DocumentosTable;
