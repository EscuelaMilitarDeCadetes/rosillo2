// src/features/calificaciones/calificacionResponsableSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'investigacion-formal/';

// Alimenta calificarProyectosXFacultad.html y calificarProyectosXGrupo.html
// (son la misma pantalla, solo cambia si se filtra por facultad_id o
// grupo_id — ambos ya vienen resueltos en state.auth tras el login/MeView).
//
// A diferencia de calificacionSlice.js (sin-calificar/calificados, que no
// paginan), aquí se usa 'buscar/' — sí pagina en servidor y ahora sí
// acepta facultad_id/grupo_id + estado_finalizado_calificacion.


export const fetchProyectosPorResponsable = createAsyncThunk(
  'calificacionResponsable/fetch',
  async ({ facultadId, grupoId, filtros = {}, page = 1 }, { rejectWithValue }) => {
    try {
      const params = { page, ...filtros };
      if (facultadId) params.facultad_id = facultadId;
      if (grupoId) params.grupo_id = grupoId;
      const response = await axiosInstance.get(`${BASE}proyecto-convocatoria/buscar/`, { params });
      return response.data; // { count, next, previous, results }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Error al cargar los proyectos.'
      );
    }
  }
);

const calificacionResponsableSlice = createSlice({
  name: 'calificacionResponsable',
  initialState: {
    resultados: [],
    totalRegistros: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProyectosPorResponsable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProyectosPorResponsable.fulfilled, (state, action) => {
        state.loading = false;
        state.resultados = action.payload.results;
        state.totalRegistros = action.payload.count;
      })
      .addCase(fetchProyectosPorResponsable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default calificacionResponsableSlice.reducer;