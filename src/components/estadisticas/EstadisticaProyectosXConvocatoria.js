import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects } from '../../features/proyectos/projectsSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Chart } from 'primereact/chart';

const EstadisticaProyectosXConvocatoria = () => {
  const dispatch = useDispatch();
  const { filteredProjects, loading } = useSelector((state) => state.projects);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Estadísticas de Proyectos por Convocatoria</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  // Preparar datos para el gráfico (ejemplo)
  const chartData = {
    labels: ['Convocatoria 1', 'Convocatoria 2', 'Convocatoria 3'],
    datasets: [
      {
        data: [
          filteredProjects.filter(p => p.convocatoria_details.nombre_convocatoria === 'Convocatoria 1').length,
          filteredProjects.filter(p => p.convocatoria_details.nombre_convocatoria === 'Convocatoria 2').length,
          filteredProjects.filter(p => p.convocatoria_details.nombre_convocatoria === 'Convocatoria 3').length,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const lightOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#495057',
        },
      },
    },
  };

  return (
    <div>
      <div className="card">
        <Chart type="pie" data={chartData} options={lightOptions} style={{ position: 'relative', width: '40%' }} />
      </div>
      <DataTable
        value={filteredProjects}
        header={header}
        loading={loading}
        paginator
        rows={10}
        globalFilter={globalFilter}
        emptyMessage="No se encontraron proyectos."
        responsiveLayout="scroll"
      >
        <Column field="proyecto.titulo" header="Título del Proyecto" sortable />
        <Column field="convocatoria_details.nombre_convocatoria" header="Convocatoria" sortable />
        <Column field="fecha_presentacion" header="Fecha Presentación" sortable />
        <Column field="estado" header="Estado" sortable />
      </DataTable>
    </div>
  );
};

export default EstadisticaProyectosXConvocatoria;
