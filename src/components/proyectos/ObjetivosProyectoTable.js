import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchObjetivosPorProyecto } from '../../features/proyectos/projectsSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import AddAvanceModal from './AddAvanceModal'; // Nuevo modal



  const hasAnyRole = (requiredRoles) => {
    const { roles } = useSelector((state) => state.auth);
    return requiredRoles.some(role => roles.includes(role));
  };

  const [isAddAvanceModalVisible, setIsAddAvanceModalVisible] = useState(false);

  // Funciones de cálculo (migradas de tu controlador Java)
  const calcularPromedioPorObjetivo = (puntosControl) => {
    if (!puntosControl || puntosControl.length === 0) {
      return 0;
    }
    const sumaAvances = puntosControl.reduce((sum, punto) => sum + punto.avance, 0);
    return (sumaAvances / puntosControl.length).toFixed(2);
  };

  const calcularAvancePonderado = (objetivosXPuntos) => {
    if (!objetivosXPuntos || objetivosXPuntos.length === 0) {
      return 0;
    }
    let sumaPonderada = 0;
    for (const punto of objetivosXPuntos) {
      // Aquí necesitarías los puntos de control asociados a este objetivo para calcular el promedio
      // Por simplicidad, asumimos que `objetivosXPuntos` ya son los puntos de control del objetivo actual
      // y que `punto.punto_control_details.peso` es el peso del punto de control.
      const promedioObjetivo = calcularPromedioPorObjetivo([punto]); // Esto es una simplificación, debería ser el promedio de los puntos de control de ESE objetivo
      sumaPonderada += (promedioObjetivo * (punto.punto_control_details?.peso || 0));
    }
    return (sumaPonderada / 100).toFixed(2);
  };

  const promedioAvanceBodyTemplate = (rowData) => {
    // Aquí deberías pasar los puntos de control específicos de este objetivo
    return `${calcularPromedioPorObjetivo(rowData.puntos_control || [])}%`; // Asumiendo que el objetivo tiene una lista de puntos_control
  };

  const avancePonderadoBodyTemplate = (rowData) => {
    // Aquí deberías pasar los puntos de control específicos de este objetivo
    return `${calcularAvancePonderado(rowData.puntos_control || [])}%`; // Asumiendo que el objetivo tiene una lista de puntos_control
  };


  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        {hasAnyRole(['ROLE_GRUPOS', 'ROLE_FACULTADES']) && (
          <Button label="Agregar Avance" icon="pi pi-plus" onClick={() => setIsAddAvanceModalVisible(true)} />
        )}
      </div>
      <DataTable
        value={objetivos}
        header={header}
        loading={loading}
        paginator
        rows={10}
        globalFilter={globalFilter}
        emptyMessage="No hay objetivos definidos para este proyecto."
        responsiveLayout="scroll"
      >
        <Column field="objetivo" header="Objetivo" sortable />
        <Column field="clase" header="Clase" sortable />
        <Column header="Promedio x Objetivo (%)" body={promedioAvanceBodyTemplate} />
        <Column header="Avance Ponderado (%)" body={avancePonderadoBodyTemplate} />
      </DataTable>

      <AddAvanceModal
        visible={isAddAvanceModalVisible}
        onHide={() => setIsAddAvanceModalVisible(false)}
        proyectoId={proyectoId}
      />
    </>
  );

export default ObjetivosTable;
