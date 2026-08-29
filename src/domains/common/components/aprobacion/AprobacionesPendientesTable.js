// src/domains/common/components/aprobacion/AprobacionesPendientesTable.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Message } from 'primereact/message';
import {
  fetchAprobacionesPendientes,
  aprobarSolicitud,
  rechazarSolicitud,
  limpiarErrorAprobacion,
} from '../../features/aprobacion/aprobacionSlice';

// usuarioId: si se recibe, consulta el turno de ESE usuario en lugar del
// propio (uso administrativo: un supervisor/decano revisando la cola de
// otro revisor). soloLectura oculta las acciones aprobar/rechazar, porque
// resolver el turno de otro revisor no es una acción que deba delegarse
// desde esta vista de consulta.
const AprobacionesPendientesTable = ({ usuarioId, soloLectura = false }) => {
  const dispatch = useDispatch();
  const { pendientes, loading, error, actioningId, actionError } = useSelector((state) => state.aprobacion);
  const { user } = useSelector((state) => state.auth);
  const [modalRechazo, setModalRechazo] = useState(null); // aprobacion seleccionada
  const [observacion, setObservacion] = useState('');

  const idEfectivo = usuarioId ?? user?.id;

  useEffect(() => {
    if (idEfectivo) dispatch(fetchAprobacionesPendientes(idEfectivo));
  }, [dispatch, idEfectivo]);

  const handleAprobar = (aprobacion) => {
    dispatch(aprobarSolicitud({ aprobacionId: aprobacion.id }));
  };

  const abrirRechazo = (aprobacion) => {
    dispatch(limpiarErrorAprobacion());
    setObservacion('');
    setModalRechazo(aprobacion);
  };

  const confirmarRechazo = () => {
    if (!observacion.trim()) return;
    dispatch(rechazarSolicitud({ aprobacionId: modalRechazo.id, observacion: observacion.trim() })).then((result) => {
      if (rechazarSolicitud.fulfilled.match(result)) setModalRechazo(null);
    });
  };

  const accionesTemplate = (rowData) => (
    <div className="d-flex gap-2">
      <Button
        label="Aprobar"
        icon="pi pi-check"
        className="p-button-success p-button-sm"
        loading={actioningId === rowData.id}
        onClick={() => handleAprobar(rowData)}
      />
      <Button
        label="Rechazar"
        icon="pi pi-times"
        className="p-button-danger p-button-sm"
        loading={actioningId === rowData.id}
        onClick={() => abrirRechazo(rowData)}
      />
    </div>
  );

  return (
    <>
      {error && <Message severity="error" className="mb-3 w-full" text={error} />}
      <DataTable
        value={pendientes}
        loading={loading}
        emptyMessage={
          soloLectura
            ? 'Este usuario no tiene solicitudes de aprobación pendientes.'
            : 'No tiene solicitudes de aprobación pendientes.'
        }
        responsiveLayout="scroll"
      >
        <Column field="tipo_documento_nombre" header="Tipo de Documento" />
        <Column field="id_documento" header="ID Documento" />
        <Column field="fecha_revision" header="Fecha" body={(r) => new Date(r.fecha_revision).toLocaleString('es-CO')} />
        {!soloLectura && <Column header="Acciones" body={accionesTemplate} />}
      </DataTable>
      {!soloLectura && (
        <Dialog
          header="Rechazar solicitud de aprobación"
          visible={!!modalRechazo}
          onHide={() => setModalRechazo(null)}
          style={{ width: '30rem' }}
        >
          {actionError && <Message severity="error" className="mb-3 w-full" text={actionError} />}
          <label className="d-block small mb-1">Motivo del rechazo (obligatorio)</label>
          <InputTextarea value={observacion} onChange={(e) => setObservacion(e.target.value)} rows={4} className="w-100" />
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button label="Cancelar" className="p-button-text" onClick={() => setModalRechazo(null)} />
            <Button label="Confirmar Rechazo" className="p-button-danger" disabled={!observacion.trim()} onClick={confirmarRechazo} />
          </div>
        </Dialog>
      )}
    </>
  );
};

export default AprobacionesPendientesTable;