// src/features/procesosFormativos/procesosFormativosSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchProcesosActivos = createAsyncThunk(
  'procesosFormativos/fetchActivos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('investigacion-formativa/proceso-formativo/activos/');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Error al cargar los procesos formativos activos'
      );
    }
  }
);

const procesosFormativosSlice = createSlice({
  name: 'procesosFormativos',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProcesosActivos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProcesosActivos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProcesosActivos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default procesosFormativosSlice.reducer;