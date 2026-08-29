// src/domains/formal/components/proyectos/DocumentosProyectoTable.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDocumentosPorProyecto, deleteDocumentoProyecto, fetchTiposDocumentoProyecto } from '../../features/proyectos/documentosSlice';
import { habilitarDocumentoParaFirma } from '../../features/documentoFirma/documentoFirmaSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import AddDocumentoProyectoModal from './AddDocumentProjectModal';
import ConfirmationModal from '../common/ConfirmationModal';
import GestionarFirmantesModal from '../../../common/components/documentoFirma/GestionarFirmantesModal';
import AsignarTareaModal from '../../../common/components/tarea/AsignarTareaModal';
import axiosInstance from '../../api/axiosInstance';

// El catálogo de "documentos requeridos" se obtiene de
// TipoDocumento filtrado por grupo='proyecto'
const DocumentosProyectoTable = ({ proyectoId }) => {
  const dispatch = useDispatch();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isAddDocModalVisible, setIsAddDocModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [enviandoFirmaId, setEnviandoFirmaId] = useState(null);
  const [docFirmantes, setDocFirmantes] = useState(null); // documento sobre el que se abre el panel de firmantes
  const [modalTareaVisible, setModalTareaVisible] = useState(false);
  const { documentos, tiposDocumentoProyecto, loading } = useSelector((state) => state.documentos);
  const { roles } = useSelector((state) => state.auth);
  const canModify = roles?.some((r) => ['CINTERNO', 'CEXTERNO'].includes(r));

  useEffect(() => {
    if (proyectoId) {
      dispatch(fetchDocumentosPorProyecto(proyectoId));
      dispatch(fetchTiposDocumentoProyecto());
    }
  }, [dispatch, proyectoId]);

  const combinedDocuments = (tiposDocumentoProyecto || []).map((tipoDoc) => {
    const existingDoc = (documentos || []).find(
      (doc) => doc.tipo_documento_nombre === tipoDoc.nombre_documento
    );
    return (
      existingDoc || {
        id: null,
        proyecto: proyectoId,
        tipo_documento_nombre: tipoDoc.nombre_documento,
        ruta_documento: null,
        estado: null, // sin documento cargado, no aplica un estado de firma
        is_required: true,
      }
    );
  });

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Documentos del Proyecto</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const handleDownload = async (doc) => {
    if (!doc.ruta_documento) return;
    setDownloadingId(doc.id);
    try {
      const response = await axiosInstance.get(`common/documento-firma/${doc.id}/descargar/`, {
        responseType: 'blob',
      });
      const disposition = response.headers['content-disposition'];
      let filename = doc.tipo_documento_nombre || 'documento';
      if (disposition) {
        const match = disposition.match(/filename="?([^"])"?/);
        if (match && match[1]) filename = match[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setIsDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    if (docToDelete) {
      dispatch(deleteDocumentoProyecto({ documentoId: docToDelete.id, proyectoId })).then((result) => {
        if (deleteDocumentoProyecto.fulfilled.match(result)) {
          setIsDeleteConfirmVisible(false);
          setDocToDelete(null);
        }
      });
    }
  };

  const handleEnviarAFirma = (doc) => {
    setEnviandoFirmaId(doc.id);
    dispatch(habilitarDocumentoParaFirma(doc.id)).then((result) => {
      setEnviandoFirmaId(null);
      if (habilitarDocumentoParaFirma.fulfilled.match(result)) {
        // refresca para que el Tag de estado pase de BORRADOR a EN_FIRMAS
        dispatch(fetchDocumentosPorProyecto(proyectoId));
      }
    });
  };

  const statusBodyTemplate = (rowData) => {
    if (!rowData.estado) return <Tag value="PENDIENTE" severity="warning" />;
    let severity;
    switch (rowData.estado) {
      case 'BORRADOR': severity = 'secondary'; break;
      case 'EN_FIRMAS': severity = 'info'; break;
      case 'FIRMADO': severity = 'success'; break;
      case 'RECHAZADO': severity = 'danger'; break;
      default: severity = 'secondary'; break;
    }
    return <Tag value={rowData.estado} severity={severity} />;
  };

  const actionBodyTemplate = (rowData) => (
    <div className="d-flex gap-2">
      {rowData.ruta_documento && (
        <Button
          icon="pi pi-download"
          className="p-button-rounded p-button-info p-button-sm"
          tooltip="Descargar"
          loading={downloadingId === rowData.id}
          onClick={() => handleDownload(rowData)}
        />
      )}
      {canModify && rowData.id && ['BORRADOR', 'RECHAZADO'].includes(rowData.estado) && (
        <Button
          icon="pi pi-send"
          className="p-button-rounded p-button-warning p-button-sm"
          tooltip={rowData.estado === 'RECHAZADO' ? 'Reenviar a firma' : 'Enviar a firma'}
          loading={enviandoFirmaId === rowData.id}
          onClick={() => handleEnviarAFirma(rowData)}
        />
      )}
      {canModify && rowData.id && ['EN_FIRMAS', 'FIRMADO', 'RECHAZADO'].includes(rowData.estado) && (
        <Button
          icon="pi pi-users"
          className="p-button-rounded p-button-help p-button-sm"
          tooltip="Gestionar Firmantes"
          onClick={() => setDocFirmantes(rowData)}
        />
      )}
      {canModify && rowData.id && ['BORRADOR', 'RECHAZADO'].includes(rowData.estado) && (
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" tooltip="Borrar" onClick={() => handleDeleteClick(rowData)} />
      )}
      {canModify && !rowData.ruta_documento && (
        <Button icon="pi pi-upload" className="p-button-rounded p-button-secondary p-button-sm" tooltip="Subir Documento" onClick={() => setIsAddDocModalVisible(true)} />
      )}
    </div>
  );

  return (
    <>
      <div className="d-flex justify-content-end gap-2 mb-3">
        {canModify && (
          <>
            <Button label="Nueva Tarea" icon="pi pi-calendar-plus" className="p-button-outlined" onClick={() => setModalTareaVisible(true)} />
            <Button label="Agregar Documento" icon="pi pi-plus" onClick={() => setIsAddDocModalVisible(true)} />
          </>
        )}
      </div>
      <DataTable
        value={combinedDocuments}
        header={header}
        loading={loading}
        paginator
        rows={10}
        globalFilter={globalFilter}
        emptyMessage="No hay documentos asociados a este proyecto."
        responsiveLayout="scroll"
      >
        <Column field="tipo_documento_nombre" header="Tipo de Documento" sortable />
        <Column field="ruta_documento" header="Nombre del Archivo" sortable />
        <Column header="Estado" body={statusBodyTemplate} sortable field="estado" />
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
        header="Confirmar Borrado de Documento"
      >
        <p>¿Está seguro de que desea borrar el documento <strong>{docToDelete?.tipo_documento_nombre}</strong>?</p>
      </ConfirmationModal>
      <GestionarFirmantesModal
        visible={!!docFirmantes}
        onHide={() => setDocFirmantes(null)}
        documento={docFirmantes}
      />
      <AsignarTareaModal
        visible={modalTareaVisible}
        onHide={() => setModalTareaVisible(false)}
        contentTypeAppLabel="investigacion_formal"
        contentTypeModel="proyecto"
        objectId={proyectoId}
        objetoLabel={`Proyecto #${proyectoId}`}
      />
    </>
  );
};

export default DocumentosProyectoTable;