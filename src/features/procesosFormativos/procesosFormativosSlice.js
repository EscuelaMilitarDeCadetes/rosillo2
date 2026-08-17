import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Análogo a fetchOpenConvocatorias, pero para el dominio formativa.
// ProcesoFormativoViewSet.activos (investigacion_formativa/views/proceso_formativo_viewset.py)
// devuelve un array plano vía ProcesoFormativoSerializer (no paginado),
// igual que ConvocatoriaViewSet con estado=true.
export const fetchProcesosActivos = createAsyncThunk(
  'procesosFormativos/fetchActivos',
  async (_, { rejectWithValue }) => {
    try {
      // OJO: el prefijo es 'investigacion-formativa/', a diferencia de
      // convocatoriasSlice.js que llama 'convocatorias-internas/' sin
      // prefijo (eso apunta a config/urls.py: 'api/investigacion-formal/'
      // es el prefijo real de convocatorias-internas, así que ese slice
      // probablemente también necesita revisión — no lo toco aquí porque
      // no es parte de este alcance, pero quedó anotado).
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