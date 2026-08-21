import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'; // Importa el reducer de autenticación
import convocatoriasReducer from '../features/convocatorias/convocatoriasSlice'; // Importa el nuevo reducer
import usersReducer from '../features/usuarios/usersSlice.js'; // Importa el reducer de usuarios
import calificacionReducer from '../features/calificaciones/calificacionSlice';
import metadataReducer from '../features/metadata/metadataSlice'; // Importa el reducer de metadatos
import projectsReducer from '../features/proyectos/projectsSlice.js'; // Importa el nuevo reducer
import notificacionesReducer from '../features/notificaciones/notificacionesSlice';
import procesosFormativosReducer from '../features/procesosFormativos/procesosFormativosSlice';
import catalogosReducer from '../features/catalogos/catalogosSlice';
import calificacionResponsableReducer from '../features/calificaciones/calificacionResponsableSlice';
import historialReducer from '../features/historial/historialSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer, // Añade el reducer de autenticación
    convocatorias: convocatoriasReducer, // Añade el reducer de convocatorias
    calificaciones: calificacionReducer, // Añade el reducer de calificaciones
    proyectos: projectsReducer, // Añade el reducer de proyectos
    usuarios: usersReducer, // Añade el reducer de usuarios
    metadata: metadataReducer, // Añade el reducer de metadatos
    notificaciones: notificacionesReducer, // Añade el reducer de notificaciones
    procesosFormativos: procesosFormativosReducer, // Añade el reducer de procesos formativos
    catalogos: catalogosReducer, // Añade el reducer de catálogos
    calificacionResponsable: calificacionResponsableReducer, // Añade el reducer de calificaciones por responsable
    historial: historialReducer, // Añade el reducer de historial
  },
});
