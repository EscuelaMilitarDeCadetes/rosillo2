// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'; // Importa el reducer de autenticación
import convocatoriasReducer from '../features/convocatorias/convocatoriasSlice'; // Importa el reducer de convocatoria
import rolesUsuarioReducer from '../features/usuarios/rolesUsuarioSlice.js'; // Importa el reducer de rolesUsuario
import personaGrupoReducer from '../features/usuarios/personaGrupoSlice.js'; // Importa el reducer de personaGrupo
import usuarioLifecycleReducer from '../features/usuarios/usuarioLifecycleSlice.js'; // Importa el reducer de usuarioLifecycle
import usuarioXPersonaReducer from '../features/usuarioXPersona/usuarioXPersonaSlice'; // Importa el reducer de usuarioXPersona
import calificacionReducer from '../features/calificaciones/calificacionSlice'; // Importa el reducer de calificaciones
import metadataReducer from '../features/metadata/metadataSlice'; // Importa el reducer de metadatos
import avanceReducer from '../features/proyectos/avanceSlice.js'; // Importa el reducer de avance
import documentosReducer from '../features/proyectos/documentosSlice.js'; // Importa el reducer de documentos
import gastosReducer from '../features/proyectos/gastoSlice.js'; // Importa el reducer de gastos
import investigadoresReducer from '../features/proyectos/investigadoresSlice.js'; // Importa el reducer de investigadores
import montosReducer from '../features/proyectos/montoSlice.js'; // Importa el reducer de montos
import objetivosReducer from '../features/proyectos/objetivosSlice.js'; // Importa el reducer de objetivos 
import productosReducer from '../features/proyectos/productosSlice.js'; // Importa el reducer de productos
import proyectosReducer from '../features/proyectos/proyectosSlice.js'; // Importa el reducer de proyectos
import notificacionesReducer from '../features/notificaciones/notificacionesSlice'; // Importa el reducer de notificaciones
import procesosFormativosReducer from '../features/procesosFormativos/procesosFormativosSlice'; // Importa el reducer de  procesos formativos
import catalogosReducer from '../features/catalogos/catalogosSlice'; // Importa el reducer de catalogos
import calificacionResponsableReducer from '../features/calificaciones/calificacionResponsableSlice'; // Importa el reducer de calificaciones
import historialReducer from '../features/historial/historialSlice'; // Importa el reducer de historial
import gerentesReducer from '../features/gerentes/gerentesSlice'; // Importa el reducer de gerente
import personasReducer from '../features/personas/personasSlice'; // Importa el reducer de personas
import personaXGrupoReducer from '../features/personaXGrupo/personaXGrupoSlice'; // Importa el reducer de personaXGrupo
import usuarioAdminReducer from '../features/usuarioAdmin/usuarioAdminSlice'; // Importa el reducer de usuarioAdmin
import reportesInstitucionalesReducer from '../features/reportesInstitucionales/reportesInstitucionalesSlice'; // Importa el reducer de reportesInstitucionales
import soporteReducer from '../features/soporte/soporteSlice.js'; // Importa el reducer de soporte
import estadisticasReducer from '../features/estadisticas/estadisticasSlice'; // Importa el reducer de estadísticas
import controlCambiosReducer from '../features/controlCambios/controlCambiosSlice'; // Importa el reducer de control cambios
import productoXGrupoFiltrosReducer from '../features/catalogos/productoXGrupoFiltrosSlice'; // Importa el reducer de productoXGrupo
import tipoCalificacionFiltrosReducer from '../features/catalogos/tipoCalificacionFiltrosSlice'; // Importa el reducer de tipoCalificacion
import tipoRubroFiltrosReducer from '../features/catalogos/tipoRubroFiltrosSlice'; // Importa el reducer de tipoRubro
import entidadExternaReducer from '../features/crm/entidadExternaSlice'; // Importa el reducer de entidadExterna
import interaccionReducer from '../features/crm/interaccionSlice'; // Importa el reducer de interaccion
import indicadorImpactoReducer from '../features/crm/indicadorImpactoSlice'; // Importa el reducer de indicadorImpacto
import documentoFirmaReducer from '../features/documentoFirma/documentoFirmaSlice';  // Importa el reducer de documentoFirma
import documentoFirmanteReducer from "../features/documentoFirmante/documentoFirmanteSlice"; // Importa el reducer de documentoFirmante
import aprobacionReducer from '../features/aprobacion/aprobacionSlice'; // Importa el reducer de aprobacion
import plantillaDocumentoReducer from "../features/plantillaDocumento/plantillaDocumentoSlice"; // Importa el reducer de plantillaDocumento
import tareaReducer from "../features/tarea/tareaSlice"; // Importa el reducer de tarea


export const store = configureStore({
  reducer: {
    auth: authReducer, // Añade el reducer de autenticación
    convocatorias: convocatoriasReducer, // Añade el reducer de convocatorias
    calificaciones: calificacionReducer, // Añade el reducer de calificaciones
    avance: avanceReducer, // Añade el reducer de avance
    documentos: documentosReducer, // Añade el reducer de documentos
    gastos: gastosReducer, // Añade el reducer de gastos
    investigadores: investigadoresReducer, // Añade el reducer de investigadores
    montos: montosReducer, // Añade el reducer de montos
    objetivos: objetivosReducer, // Añade el reducer de objetivos
    productos: productosReducer, // Añade el reducer de productos
    proyectos: proyectosReducer, // Añade el reducer de proyectos
    rolesUsuario: rolesUsuarioReducer, // Añade el reducer de rolesUsuario
    personaGrupo: personaGrupoReducer, // Añade el reducer de personaGrupo
    usuarioLifecycle: usuarioLifecycleReducer, // Añade el reducer de usuarioLifecycle
    metadata: metadataReducer, // Añade el reducer de metadatos
    notificaciones: notificacionesReducer, // Añade el reducer de notificaciones
    procesosFormativos: procesosFormativosReducer, // Añade el reducer de procesos formativos
    catalogos: catalogosReducer, // Añade el reducer de catálogos
    calificacionResponsable: calificacionResponsableReducer, // Añade el reducer de calificaciones por responsable
    historial: historialReducer, // Añade el reducer de historial
    gerentes: gerentesReducer, // Añade el reducer de gerente
    usuarioXPersona: usuarioXPersonaReducer, // Añade el reducer de usuarioXPersona
    personas: personasReducer, // Añade el reducer de persona
    personaXGrupo: personaXGrupoReducer, // Añade el reducer de personaXGrupo
    usuarioAdmin: usuarioAdminReducer, // Añade el reducer de usuarioAdmin
    reportesInstitucionales: reportesInstitucionalesReducer, // Añade el reducer de reportesInstitucionales
    soporte: soporteReducer, // Añade el reducer soporte
    estadisticas: estadisticasReducer, // Añade el reducer de estadísticas
    controlCambios: controlCambiosReducer, // Añade el reducer de control de cambios
    productoXGrupoFiltros: productoXGrupoFiltrosReducer, // Añade el reducer de productoXGrupo
    tipoCalificacionFiltros: tipoCalificacionFiltrosReducer, // Añade el reducer de tipoCalificacion
    tipoRubroFiltros: tipoRubroFiltrosReducer, // Añade el reducer de tipoRubro
    entidadExterna: entidadExternaReducer, // Añade el reducer de entidadExterna
    interaccion: interaccionReducer, // Añade el reducer de interaccion
    indicadorImpacto: indicadorImpactoReducer, // Añade el reducer de indicadorImpacto
    documentoFirma: documentoFirmaReducer, // Añade el reducer de documentoFirma
    documentoFirmante: documentoFirmanteReducer, // Añade el reducer de documentoFirmante
    aprobacion: aprobacionReducer, // Añade el reducer de aprobacion
    plantillaDocumento: plantillaDocumentoReducer, // Añade el reducer de plantillaDocumento
    tarea: tareaReducer, // Añade el reducer de tarea
  },
});
