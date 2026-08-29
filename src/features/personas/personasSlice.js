// src/features/personas/personasSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const BASE = 'institucional/personas/';

export const fetchPersonas = createAsyncThunk(
  'personas/fetchPersonas',
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(BASE, { params: { page, page_size: pageSize } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar las personas.');
    }
  }
);

export const fetchPersona = createAsyncThunk(
  'personas/fetchPersona',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Persona no encontrada.');
    }
  }
);

export const crearPersona = createAsyncThunk(
  'personas/crearPersona',
  async (datos, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE, datos);
      dispatch(fetchPersonas());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === 'string'
          ? data
          : data && Object.values(data).flat().join(' ') || 'Error al crear la persona.';
      return rejectWithValue(mensaje);
    }
  }
);

export const actualizarPersona = createAsyncThunk(
  'personas/actualizarPersona',
  async ({ id, ...datos }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${BASE}${id}/`, datos);
      dispatch(fetchPersonas());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === 'string'
          ? data
          : data && Object.values(data).flat().join(' ') || 'Error al actualizar la persona.';
      return rejectWithValue(mensaje);
    }
  }
);

const personasSlice = createSlice({
  name: 'personas',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    seleccionada: null,
    seleccionadaLoading: false,
    saving: false,
    error: null,
  },
  reducers: {
    limpiarErrorPersona: (state) => {
      state.error = null;
    },
    limpiarPersonaSeleccionada: (state) => {
      state.seleccionada = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersonas.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPersonas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results ?? [];
        state.total = action.payload.count ?? 0;
      })
      .addCase(fetchPersonas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPersona.pending, (state) => {
        state.seleccionadaLoading = true;
      })
      .addCase(fetchPersona.fulfilled, (state, action) => {
        state.seleccionadaLoading = false;
        state.seleccionada = action.payload;
      })
      .addCase(fetchPersona.rejected, (state, action) => {
        state.seleccionadaLoading = false;
        state.error = action.payload;
      })
      .addCase(crearPersona.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(crearPersona.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(crearPersona.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(actualizarPersona.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(actualizarPersona.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(actualizarPersona.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorPersona, limpiarPersonaSeleccionada } = personasSlice.actions;
export default personasSlice.reducer;