import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunk para obtener los proyectos que necesitan ser calificados
export const fetchProyectosPorCalificar = createAsyncThunk(
  'calificaciones/fetchProyectosPorCalificar',
  async (_, { rejectWithValue }) => {
    try {
      // Asumimos que tu API tiene un endpoint para esto, ej: /api/proyectos-x-convocatoria/?necesita_calificacion=true
      const response = await axiosInstance.get('proyectos-x-convocatoria/?necesita_calificacion=true');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar los proyectos por calificar.');
    }
  }
);

// Thunk para obtener los detalles de la calificación de un proyecto específico
export const fetchCalificacion = createAsyncThunk(
  'calificaciones/fetchCalificacion',
  async (proyectoId, { rejectWithValue }) => {
    try {
      // Asumimos que tienes un endpoint para esto, ej: /api/calificaciones/123/
      const response = await axiosInstance.get(`calificaciones/${proyectoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar la calificación.');
    }
  }
);

// Thunk para actualizar la calificación de un proyecto
export const updateCalificacion = createAsyncThunk(
  'calificaciones/updateCalificacion',
  async ({ calificacionId, data }, { dispatch, rejectWithValue }) => {
    try {
      // Asumimos que tienes un endpoint para esto, ej: /api/calificaciones/123/
      const response = await axiosInstance.put(`calificaciones/${calificacionId}/`, data);
      // Después de actualizar, volvemos a cargar la lista de proyectos por calificar
      dispatch(fetchProyectosPorCalificar());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al guardar la calificación.');
    }
  }
);

const calificacionSlice = createSlice({
  name: 'calificaciones',
  initialState: {
    proyectosPorCalificar: [],
    calificacionActual: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Proyectos Por Calificar
      .addCase(fetchProyectosPorCalificar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProyectosPorCalificar.fulfilled, (state, action) => {
        state.loading = false;
        state.proyectosPorCalificar = action.payload;
      })
      .addCase(fetchProyectosPorCalificar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Calificacion
      .addCase(fetchCalificacion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalificacion.fulfilled, (state, action) => {
        state.loading = false;
        state.calificacionActual = action.payload;
      })
      .addCase(fetchCalificacion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Calificacion
      .addCase(updateCalificacion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCalificacion.fulfilled, (state) => {
        state.loading = false;
        // La lista se refresca con fetchProyectosPorCalificar
      })
      .addCase(updateCalificacion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default calificacionSlice.reducer;
