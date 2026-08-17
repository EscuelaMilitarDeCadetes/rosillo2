import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchNotificacionesIniciales = createAsyncThunk(
  'notificaciones/fetchIniciales',
  async (usuarioId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`common/notificacion/no-leidas/${usuarioId}/`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const marcarTodasLeidas = createAsyncThunk(
  'notificaciones/marcarTodasLeidas',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post('common/notificacion/marcar-todas-leidas/');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const notificacionesSlice = createSlice({
  name: 'notificaciones',
  initialState: {
    items: [],
    noLeidas: 0,
    status: 'idle',
  },
  reducers: {
    notificacionRecibida: (state, action) => {
      state.items.unshift(action.payload);
      state.noLeidas += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificacionesIniciales.fulfilled, (state, action) => {
        state.items = action.payload;
        state.noLeidas = action.payload.length;
        state.status = 'succeeded';
      })
      .addCase(marcarTodasLeidas.fulfilled, (state) => {
        state.noLeidas = 0;
      });
  },
});

export const { notificacionRecibida } = notificacionesSlice.actions;
export default notificacionesSlice.reducer;