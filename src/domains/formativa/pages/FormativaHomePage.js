import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProcesosActivos } from '../../../features/procesosFormativos/procesosFormativosSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';

/**
 * Home del dominio "investigación formativa", montada en "/formativa".
 * Equivalente funcional de FormalHomePage.js (que a su vez es el
 * equivalente de index.html): mientras aquella lista convocatorias
 * internas abiertas, esta lista procesos formativos activos vía
 * ProcesoFormativoViewSet.activos.
 */
const FormativaHomePage = () => {
  const dispatch = useDispatch();
  const { items: procesos, loading, error } = useSelector((state) => state.procesosFormativos);

  useEffect(() => {
    dispatch(fetchProcesosActivos());
  }, [dispatch]);

  const estadoBodyTemplate = (rowData) => {
    const estado = rowData.estado_actual || 'Sin estado';
    return <span className="badge bg-secondary">{estado}</span>;
  };

  return (
    <div className="container mt-4">
      <div className="row g-5">
        <div className="col-lg-6">
          <h2>Investigación Formativa</h2>
          <p className="text-muted">
            Espacio para el seguimiento de procesos formativos: modalidades
            de grado, postulaciones, tutorías, evaluación de trabajos y
            certificaciones, desde la formulación hasta la calificación
            final.
          </p>
        </div>
        <div className="col-lg-6">
          <h3>Procesos Formativos Activos</h3>
          {loading && (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />
            </div>
          )}
          {error && <div className="alert alert-danger">Error: {error}</div>}
          {!loading && !error && (
            <DataTable
              value={procesos}
              responsiveLayout="scroll"
              emptyMessage="No hay procesos formativos activos en este momento."
            >
              <Column field="titulo" header="Título" sortable></Column>
              <Column field="modalidad_nombre" header="Modalidad" sortable></Column>
              <Column field="fecha_inicio" header="Inicio" sortable></Column>
              <Column field="fecha_fin" header="Fin" sortable></Column>
              <Column header="Estado" body={estadoBodyTemplate}></Column>
            </DataTable>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormativaHomePage;