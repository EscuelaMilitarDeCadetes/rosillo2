import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { addAvance } from '../../features/proyectos/projectsSlice'; // Necesitas crear esta acción
import ConfirmationModal from '../common/ConfirmationModal';

const AddAvanceModal = ({ visible, onHide, proyectoId }) => {
  const dispatch = useDispatch();
  const { objetivos, loading, error } = useSelector((state) => state.proyectos); // Objetivos del proyecto actual
  const { puntosControl } = useSelector((state) => state.metadata); // Asumiendo que metadataSlice carga puntosControl

  const [selectedObjetivo, setSelectedObjetivo] = useState(null);
  const [selectedPuntoControl, setSelectedPuntoControl] = useState(null);
  const [descripcionAvance, setDescripcionAvance] = useState('');
  const [avance, setAvance] = useState(0);
  const [mesAvance, setMesAvance] = useState('');
  const [anioAvance, setAnioAvance] = useState(new Date().getFullYear());
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedObjetivo(null);
      setSelectedPuntoControl(null);
      setDescripcionAvance('');
      setAvance(0);
      setMesAvance('');
      setAnioAvance(new Date().getFullYear());
      setValidationError('');
    }
  }, [visible]);

  const validateForm = () => {
    if (!selectedObjetivo || !selectedPuntoControl || !descripcionAvance || avance <= 0 || !mesAvance || !anioAvance) {
      setValidationError('Todos los campos obligatorios deben ser llenados.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleShowConfirmation = () => {
    if (validateForm()) {
      onHide();
      setIsConfirmVisible(true);
    }
  };

  const handleConfirmAdd = () => {
    const payload = {
      objetivo: selectedObjetivo,
      punto_control: selectedPuntoControl,
      descripcion_avance: descripcionAvance,
      avance,
      mes_avance: mesAvance,
      anio_avance: anioAvance,
      estado: true,
    };
    dispatch(addAvance(payload)).then((result) => {
      if (addAvance.fulfilled.match(result)) {
        setIsConfirmVisible(false);
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Agregar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  // Opciones para el dropdown de objetivos (solo los específicos si hay)
  const objetivosEspecificos = objetivos.filter(obj => obj.clase === 'especifico');

  // Opciones para el dropdown de puntos de control
  const puntosControlOptions = puntosControl.map(pc => ({
    label: pc.control,
    value: pc.id,
  }));

  const meses = [
    { label: 'Enero', value: 'Enero' }, { label: 'Febrero', value: 'Febrero' }, { label: 'Marzo', value: 'Marzo' },
    { label: 'Abril', value: 'Abril' }, { label: 'Mayo', value: 'Mayo' }, { label: 'Junio', value: 'Junio' },
    { label: 'Julio', value: 'Julio' }, { label: 'Agosto', value: 'Agosto' }, { label: 'Septiembre', value: 'Septiembre' },
    { label: 'Octubre', value: 'Octubre' }, { label: 'Noviembre', value: 'Noviembre' }, { label: 'Diciembre', value: 'Diciembre' },
  ];

  return (
    <>
      <Dialog header="Agregar Avance a Punto de Control" visible={visible} style={{ width: '50vw' }} footer={renderFooter} onHide={onHide}>
        <div className="p-fluid formgrid grid">
          <div className="field col-12">
            <label htmlFor="objetivo">Objetivo Específico</label>
            <Dropdown inputId="objetivo" value={selectedObjetivo} options={objetivosEspecificos} onChange={(e) => setSelectedObjetivo(e.value)} optionLabel="objetivo" optionValue="id" filter placeholder="Seleccione un objetivo" />
          </div>
          <div className="field col-12">
            <label htmlFor="puntoControl">Punto de Control</label>
            <Dropdown inputId="puntoControl" value={selectedPuntoControl} options={puntosControlOptions} onChange={(e) => setSelectedPuntoControl(e.value)} optionLabel="label" optionValue="value" filter placeholder="Seleccione un punto de control" />
          </div>
          <div className="field col-12">
            <label htmlFor="descripcionAvance">Descripción del Avance</label>
            <InputTextarea id="descripcionAvance" rows={3} value={descripcionAvance} onChange={(e) => setDescripcionAvance(e.target.value)} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="avance">Avance en %</label>
            <InputNumber id="avance" value={avance} onValueChange={(e) => setAvance(e.value)} min={0} max={100} suffix="%" />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="mesAvance">Mes de Avance</label>
            <Dropdown inputId="mesAvance" value={mesAvance} options={meses} onChange={(e) => setMesAvance(e.value)} optionLabel="label" optionValue="value" placeholder="Seleccione un mes" />
          </div>
          <div className="field col-12">
            <label htmlFor="anioAvance">Año del Avance</label>
            <InputNumber id="anioAvance" value={anioAvance} onValueChange={(e) => setAnioAvance(e.value)} mode="decimal" showButtons min={2000} max={new Date().getFullYear()} />
          </div>
        </div>
        {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </Dialog>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmAdd}
        header="Confirmar Adición de Avance"
        loading={loading}
      >
        <h6>Resumen del avance a agregar:</h6>
        <ul>
          <li><strong>Objetivo:</strong> {objetivos.find(obj => obj.id === selectedObjetivo)?.objetivo || 'N/A'}</li>
          <li><strong>Punto de Control:</strong> {puntosControl.find(pc => pc.id === selectedPuntoControl)?.control || 'N/A'}</li>
          <li><strong>Avance:</strong> {avance}%</li>
          <li><strong>Mes/Año:</strong> {mesAvance}/{anioAvance}</li>
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default AddAvanceModal;
