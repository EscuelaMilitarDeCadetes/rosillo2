import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOpenConvocatorias } from '../../../features/convocatorias/convocatoriasSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

/**
 * Antes: src/pages/HomePage.js, montada en "/" (pública).
 * Ahora: home del dominio "investigación formal", montada en "/formal"
 * dentro del bloque de rutas protegidas. El contenido es exactamente el
 * mismo que ya tenías (tabla de convocatorias abiertas + video), solo
 * cambió dónde vive y quién puede verla.
 */
const FormalHomePage = () => {
  const dispatch = useDispatch();
  const { items: convocatorias, loading, error } = useSelector((state) => state.convocatorias);

  useEffect(() => {
    dispatch(fetchOpenConvocatorias());
  }, [dispatch]);

  const downloadBodyTemplate = (rowData) => {
    const downloadUrl = `http://localhost:8082/api/documentos-convocatoria/${rowData.id}/download/`;
    return (
      <Button
        label="Descargar PDF"
        icon="pi pi-download"
        className="p-button-sm p-button-info"
        onClick={() => window.open(downloadUrl, '_blank')}
      />
    );
  };

  return (
    <div className="container mt-4">
      <div className="row g-5">
        <div className="col-lg-6">
          <div className="ratio ratio-16x9">
            <iframe
              src="https://www.youtube.com/embed/th0hgA-qSLI"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <div className="col-lg-6">
          <h3>Convocatorias Internas Abiertas</h3>

          {loading && (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />
            </div>
          )}
          {error && <div className="alert alert-danger">Error: {error}</div>}
          {!loading && !error && (
            <DataTable value={convocatorias} responsiveLayout="scroll" emptyMessage="No hay convocatorias abiertas en este momento.">
              <Column field="nombre_convocatoria" header="Nombre" sortable></Column>
              <Column field="inicio" header="Fecha Inicio" sortable></Column>
              <Column field="cierre" header="Fecha Final" sortable></Column>
              <Column header="Documento" body={downloadBodyTemplate}></Column>
            </DataTable>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormalHomePage;