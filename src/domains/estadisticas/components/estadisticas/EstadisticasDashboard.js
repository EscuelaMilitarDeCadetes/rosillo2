// src/domains/estadisticas/components/estadisticas/EstadisticasDashboard.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOpcionesFiltro } from '../../features/estadisticas/estadisticasSlice';
import FiltrosComunes from './estadisticasDashboard/FiltrosComunes';
import ProyectosPorEntidadChart from './estadisticasDashboard/charts/ProyectosPorEntidadChart';
import ProductosPorEntidadChart from './estadisticasDashboard/charts/ProductosPorEntidadChart';
import ProyectosPorAnioChart from './estadisticasDashboard/charts/ProyectosPorAnioChart';
import ProduccionPorAnioChart from './estadisticasDashboard/charts/ProduccionPorAnioChart';
import FinalizadosVsEjecucionChart from './estadisticasDashboard/charts/FinalizadosVsEjecucionChart';
import EjecucionPresupuestalChart from './estadisticasDashboard/charts/EjecucionPresupuestalChart';
import AvancePonderadoChart from './estadisticasDashboard/charts/AvancePonderadoChart';

const EstadisticasDashboard = () => {
  const dispatch = useDispatch();
  const { opcionesFiltro } = useSelector((state) => state.estadisticas);
  const [comunes, setComunes] = useState({ responsableSeleccionado: null, interno: null });

  useEffect(() => {
    dispatch(fetchOpcionesFiltro());
  }, [dispatch]);

  const handleChangeComun = (campo, valor) => setComunes((prev) => ({ ...prev, [campo]: valor }));

  return (
    <div>
      <h2 className="mb-3">Tablero de estadísticas</h2>
      <div className="card p-3 mb-4" style={{ backgroundColor: '#EAEDED' }}>
        <FiltrosComunes opciones={opcionesFiltro} filtros={comunes} onChange={handleChangeComun} />
      </div>
      <div className="d-flex flex-column gap-3">
        <ProyectosPorEntidadChart opciones={opcionesFiltro} comunes={comunes} />
        <ProductosPorEntidadChart comunes={comunes} />
        <ProyectosPorAnioChart comunes={comunes} />
        <ProduccionPorAnioChart comunes={comunes} />
        <FinalizadosVsEjecucionChart comunes={comunes} />
        <EjecucionPresupuestalChart comunes={comunes} />
        <AvancePonderadoChart comunes={comunes} />
      </div>
    </div>
  );
};

export default EstadisticasDashboard;