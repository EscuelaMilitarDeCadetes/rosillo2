import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { uploadProjectToGruplac } from '../../features/proyectos/projectsSlice';
import EditProjectDatesModal from './EditProjectDatesModal'; // Nuevo modal

const ProyectoInfo = ({ proyecto }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.proyectos);
  const { roles } = useSelector((state) => state.auth);

  const [isEditDatesModalVisible, setIsEditDatesModalVisible] = useState(false);

  if (!proyecto) {
    return null;
  }

  // Función auxiliar para verificar roles
  const hasAnyRole = (requiredRoles) => {
    return requiredRoles.some(role => roles.includes(role));
  };

  // Calcular porcentaje de avance (similar a tu calculatePercentage)
  const calculatePercentage = (proj) => {
    if (!proj.fecha_inicio || !proj.fecha_fin) return 0;
    const startDate = new Date(proj.fecha_inicio);
    const endDate = new Date(proj.fecha_fin);
    const currentDate = new Date();

    if (currentDate < startDate) return 0;
    if (currentDate > endDate) return 100;

    const timeBetweenStartAndCurrent = currentDate.getTime() - startDate.getTime();
    const timeBetweenStartAndEnd = endDate.getTime() - startDate.getTime();
    return Math.min(100, Math.max(0, (timeBetweenStartAndCurrent / timeBetweenStartAndEnd) * 100)).toFixed(0);
  };

  const handleUploadToGruplac = () => {
    dispatch(uploadProjectToGruplac(proyecto.id));
  };

  return (
    <>
      <Card title="Información General del Proyecto">
        <div className="text-center mb-4">
          <h1 className="mb-3">{proyecto.titulo}</h1>
          <div className="row justify-content-center g-2">
            {hasAnyRole(['ROLE_CINTERNOS', 'ROLE_CEXTERNOS']) && (
              <div className="col-auto">
                <Button 
                  label="Editar Fechas de Cierre" 
                  icon="pi pi-calendar-times" 
                  className="p-button-primary" 
                  onClick={() => setIsEditDatesModalVisible(true)} 
                />
              </div>
            )}
            {hasAnyRole(['ROLE_CINTERNOS', 'ROLE_CEXTERNOS']) && !proyecto.gruplac && (
              <div className="col-auto">
                <Button 
                  label="Subir a GrupLAC" 
                  icon="pi pi-upload" 
                  className="p-button-info" 
                  onClick={handleUploadToGruplac} 
                  loading={loading} 
                />
              </div>
            )}
            {proyecto.gruplac && (
              <div className="col-auto">
                <p className="fw-bold text-success">Proyecto Subido a GrupLAC</p>
              </div>
            )}
          </div>
        </div>

        <div className="row text-center mt-4">
          <div className="col-md-4">
            <strong>Inicio:</strong> <p>{proyecto.fecha_inicio}</p>
          </div>
          <div className="col-md-4">
            <strong>Fin:</strong> <p>{proyecto.fecha_fin}</p>
          </div>
          <div className="col-md-4">
            <strong>Porcentaje de Avance:</strong> <br />
            <p>{calculatePercentage(proyecto)}%</p>
          </div>
        </div>
      </Card>

      <EditProjectDatesModal
        visible={isEditDatesModalVisible}
        onHide={() => setIsEditDatesModalVisible(false)}
        proyecto={proyecto}
      />
    </>
  );
};

export default ProyectoInfo;
