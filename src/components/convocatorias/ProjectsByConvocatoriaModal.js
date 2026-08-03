import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchProjectsByConvocatoria } from '../../features/convocatorias/convocatoriasSlice';

const ProjectsByConvocatoriaModal = ({ visible, onHide, convocatoria }) => {
  const dispatch = useDispatch();
  const { projectsInConvocatoria, projectsLoading, projectsError } = useSelector((state) => state.convocatorias);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    if (visible && convocatoria?.id) {
      dispatch(fetchProjectsByConvocatoria(convocatoria.id));
    }
  }, [visible, convocatoria, dispatch]);

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Proyectos en Convocatoria: {convocatoria?.nombre_convocatoria}</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-sm" tooltip="Ver Detalles" />
      // Aquí podrías añadir más botones como "Calificar", "Ver Documentos", etc.
    );
  };

  return (
    <Dialog header={header} visible={visible} style={{ width: '70vw' }} onHide={onHide} modal>
      {projectsLoading && (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />
        </div>
      )}

      {projectsError && <div className="alert alert-danger mt-3">Error: {projectsError}</div>}

      {!projectsLoading && !projectsError && (
        <DataTable
          value={projectsInConvocatoria}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          globalFilter={globalFilter}
          emptyMessage="No se encontraron proyectos para esta convocatoria."
          responsiveLayout="scroll"
        >
          <Column field="proyecto.titulo" header="Título del Proyecto" sortable />
          <Column field="proyecto.codigo" header="Código" sortable />
          <Column field="estado" header="Estado Participación" sortable />
          <Column field="calificacion_ultimo_filtro_calificacion" header="Calificación" sortable />
          <Column header="Acciones" body={actionBodyTemplate} />
        </DataTable>
      )}
    </Dialog>
  );
};

export default ProjectsByConvocatoriaModal;
