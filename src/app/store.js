import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'; // Importa el reducer de autenticación
import convocatoriasReducer from '../features/convocatorias/convocatoriasSlice'; // Importa el nuevo reducer
import usersReducer from '../features/users/usersSlice'; // Importa el reducer de usuarios
import calificacionReducer from '../features/calificaciones/calificacionSlice';
import metadataReducer from '../features/metadata/metadataSlice'; // Importa el reducer de metadatos
import projectsReducer from '../features/projects/projectsSlice'; // Importa el nuevo reducer

export const store = configureStore({
  reducer: {
    auth: authReducer, // Añade el reducer de autenticación
    convocatorias: convocatoriasReducer, // Añade el reducer de convocatorias
    calificaciones: calificacionReducer, // Añade el reducer de calificaciones
    projects: projectsReducer, // Añade el reducer de proyectos
    users: usersReducer, // Añade el reducer de usuarios
    metadata: metadataReducer, // Añade el reducer de metadatos
  },
});
