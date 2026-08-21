// src/features/historial/historialSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

/*
  Solo lectura: no hay create/update/destroy.

  buscar/ ahora combina TODOS los filtros en una sola llamada paginada
  (texto + usuario + rango de fechas + solo_sistema, todos opcionales y en
  conjunto), en vez de 3 acciones exclusivas entre sí como antes.
*/

const BASE = "common/historial/";

export const fetchHistorial = createAsyncThunk(
  "historial/fetchHistorial",
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, {
        params: { page, page_size: pageSize },
      });
      return response.data; // { count, next, previous, results }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar el historial."
      );
    }
  }
);

// `filtros` = { texto?, usuarioId?, fechaInicio?, fechaFin?, soloSistema? }
// Todos opcionales; los que se envíen se combinan con AND en el backend.
export const buscarHistorial = createAsyncThunk(
  "historial/buscarHistorial",
  async ({ page = 1, pageSize = 10, filtros = {} } = {}, { rejectWithValue }) => {
    try {
      const params = { page, page_size: pageSize };
      if (filtros.texto) params.q = filtros.texto;
      if (filtros.usuarioId) params.usuario_id = filtros.usuarioId;
      if (filtros.fechaInicio) params.fecha_inicio = filtros.fechaInicio;
      if (filtros.fechaFin) params.fecha_fin = filtros.fechaFin;
      if (filtros.soloSistema) params.solo_sistema = true;
      const response = await axiosInstance.get(`${BASE}buscar/`, { params });
      return response.data; // { count, next, previous, results }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al buscar en el historial."
      );
    }
  }
);

export const fetchHistorialPorRangoFechas = createAsyncThunk(
  "historial/fetchPorRangoFechas",
  async ({ fechaInicio, fechaFin }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}por-rango-fechas/`, {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          "Error al filtrar el historial por rango de fechas."
      );
    }
  }
);

export const fetchHistorialPorUsuario = createAsyncThunk(
  "historial/fetchPorUsuario",
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${BASE}por-usuario/${usuarioId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
          "Error al filtrar el historial por usuario."
      );
    }
  }
);

const historialSlice = createSlice({
  name: "historial",
  initialState: {
    items: [],
    totalRecords: 0,
    filtrosActivos: false,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistorial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistorial.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.totalRecords = action.payload.count ?? 0;
        state.filtrosActivos = false;
      })
      .addCase(fetchHistorial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(buscarHistorial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buscarHistorial.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.totalRecords = action.payload.count ?? 0;
        state.filtrosActivos = true;
      })
      .addCase(buscarHistorial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarFiltro } = historialSlice.actions;
export default historialSlice.reducer;