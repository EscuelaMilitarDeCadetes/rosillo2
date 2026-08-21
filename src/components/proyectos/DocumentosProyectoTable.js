// src/components/proyectos/DocumentosProyectoTable.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDocumentosPorProyecto, deleteDocumentoProyecto } from '../../features/proyectos/projectsSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import AddDocumentoProyectoModal from './AddDocumentoProyectoModal';
import ConfirmationModal from '../common/ConfirmationModal';
import axiosInstance from '../../api/axiosInstance';

// CORREGIDO — el original tenía un bug de runtime (ReferenceError: `documentos`
// usado sin declarar) y useSelector() llamado dentro de una función auxiliar
// invocada por fila (viola Rules of Hooks). También apuntaba a
// 'documentos-x-proyecto/', que no existe.
//
// Migración real confirmada: DocumentoXProyecto (Spring) -> DocumentoFirma
// (common), vinculado al Proyecto por GenericForeignKey. El catálogo de
// "documentos requeridos" ya no se hardcodea en el frontend: se obtiene de
// TipoDocumento filtrado por grupo='proyecto' (common/tipos-documento/por-grupo/).


const DocumentosProyectoTable = ({ proyectoId }) => {
  const dispatch = useDispatch();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isAddDocModalVisible, setIsAddDocModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // 'documentos' y 'loading' no existían como variables en el archivo
  // original: se usaban sin declarar, lo que provoca un ReferenceError al
  // renderizar. Se leen del slice de proyectos.
  const { documentos, loading } = useSelector((state) => state.proyectos);
  const { roles } = useSelector((state) => state.auth);

  useEffect(() => {
    if (proyectoId) {
      dispatch(fetchDocumentosPorProyecto(proyectoId));
    }
  }, [dispatch, proyectoId]);

  // Antes: llamaba a useSelector() dentro de una función auxiliar invocada
  // condicionalmente durante el render — viola las Reglas de los Hooks.
  const canModify = roles?.some((r) => ['ROLE_CINTERNOS', 'ROLE_CEXTERNOS'].includes(r));

  const allRequiredDocs = [
    "Propuesta del Proyecto", "Carta de Presentación", "Documento de Alianza", "Acta de Inicio",
    "Acta de Seguimiento", "Control de cambios", "Informe final", "Entregables",
    "Compromisos de confidencialidad", "Cesion de derechos", "Soportes presupuestales",
    "Acta comite local", "Busqueda tecnologica", "Matricula", "Disclosure",
    "Comunicaciones oficiales", "Proceso contractual", "Comite funcional",
    "Convenio", "Comite de etica", "Acta de cierre",
  ];

  // Los campos correctos (DocumentoFirmaSerializer) son 'tipo_documento_nombre'
  // y 'ruta_documento' — el original usaba 'tipo_documento_details.nombre_documento'
  // y 'documento', que no existen en el serializer real.
  const combinedDocuments = allRequiredDocs.map((requiredDocName) => {
    const existingDoc = (documentos || []).find(
      (doc) => doc.tipo_documento_nombre === requiredDocName
    );
    return (
      existingDoc || {
        id: null,
        proyecto: proyectoId,
        tipo_documento_nombre: requiredDocName,
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

  // El backend exige el header "Authorization: Bearer <token>" para
  // descargar (ver descargarDocumentoConvocatoria) — un window.open() simple
  // no lo envía, así que hay que traerlo como blob autenticado.
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
        const match = disposition.match(/filename="?([^"]+)"?/);
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
      {canModify && rowData.id && (
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" tooltip="Borrar" onClick={() => handleDeleteClick(rowData)} />
      )}
      {canModify && !rowData.ruta_documento && (
        <Button icon="pi pi-upload" className="p-button-rounded p-button-secondary p-button-sm" tooltip="Subir Documento" onClick={() => setIsAddDocModalVisible(true)} />
      )}
    </div>
  );


  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        {canModify && (
          <Button label="Agregar Documento" icon="pi pi-plus" onClick={() => setIsAddDocModalVisible(true)} />
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
    </>
  );
};

export default DocumentosTable;