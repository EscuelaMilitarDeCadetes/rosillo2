import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Thunk asíncrono para obtener las convocatorias abiertas
export const fetchOpenConvocatorias = createAsyncThunk(
  'convocatorias/fetchOpen',
  async (_, { rejectWithValue }) => {
    try {
      // Asumimos que tu API devuelve las convocatorias activas en este endpoint
      // Puedes añadir filtros como ?estado=true si es necesario
      const response = await axiosInstance.get("convocatorias-internas/?estado=true");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las convocatorias"
      );
    }
  }
);

// Thunk para obtener TODAS las convocatorias (para la vista de administración)
export const fetchAllConvocatorias = createAsyncThunk(
  'convocatorias/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("convocatorias-internas/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar todas las convocatorias"
      );
    }
  }
);

// Thunk para crear una nueva convocatoria
export const createConvocatoria = createAsyncThunk(
  'convocatorias/create',
  async (convocatoriaData, { dispatch, rejectWithValue }) => {

    try {
      // FormData es necesario para enviar archivos
      const formData = new FormData();
      for (const key in convocatoriaData) {
        if (convocatoriaData[key] instanceof File) {
          formData.append(
            key,
            convocatoriaData[key],
            convocatoriaData[key].name
          );
        } else {
          formData.append(key, convocatoriaData[key]);
        }
      }

      const response = await axiosInstance.post('convocatorias-internas/', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch(fetchAllConvocatorias()); // Refrescar la lista después de crear
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Error al crear la convocatoria."
      );
    }
  }
);

// Thunk para activar/desactivar una convocatoria
export const toggleConvocatoriaStatus = createAsyncThunk(
  'convocatorias/toggleStatus',
  async (convocatoriaId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`convocatorias-internas/${convocatoriaId}/toggle-active/`
      );
      dispatch(fetchAllConvocatorias()); // Refrescar la lista después de cambiar el estado
      return { convocatoriaId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Error al cambiar el estado de la convocatoria."
      );
    }
  }
);

// Thunk para obtener los proyectos asociados a una convocatoria
export const fetchProjectsByConvocatoria = createAsyncThunk(
  'convocatorias/fetchProjectsByConvocatoria',
  async (convocatoriaId, { rejectWithValue }) => {
    try {
      // Asumimos que tu API tiene un filtro para obtener proyectos por convocatoria
      const response = await axiosInstance.get(`proyectos-x-convocatoria/?convocatoria_id=${convocatoriaId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar los proyectos de la convocatoria."
      );
    }
  }
);

// Thunk para obtener TODOS los documentos de convocatorias
export const fetchDocConvocatorias = createAsyncThunk(
  'convocatorias/fetchDocConvocatorias',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("documentos-x-convocatoria/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar los documentos."
      );
    }
  }
);

// Thunk para crear un nuevo documento de convocatoria
export const createDocConvocatoria = createAsyncThunk(
  'convocatorias/createDoc',
  async (docData, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("convocatoria", docData.convocatoria);
      formData.append("tipo_documento", docData.tipo_documento);
      formData.append("documento", docData.documento_file, docData.documento_file.name);

      await axiosInstance.post(
        "documentos-x-convocatoria/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      dispatch(fetchDocConvocatorias());
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al crear el documento.');
    }
  }
);

// Thunk para borrar un documento de convocatoria
export const deleteDocConvocatoria = createAsyncThunk(
  'convocatorias/deleteDoc',
  async (docId, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`documentos-x-convocatoria/${docId}/`);
      dispatch(fetchDocConvocatorias());
      return docId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Error al borrar el documento."
      );
    }
  }
);

// Thunk para obtener los proyectos de un usuario específico
export const fetchProyectosPorUsuario = createAsyncThunk(
  "convocatorias/fetchProyectosPorUsuario",
  async (userId, { rejectWithValue }) => {
    try {
      // Asumimos que tu API tiene un filtro para obtener proyectos por usuario
      const response = await axiosInstance.get(
        `proyectos-x-convocatoria/?usuario_id=${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar los proyectos del usuario."
      );
    }
  }
);

const convocatoriasSlice = createSlice({
  name: 'convocatorias',
  initialState: {
    items: [],
    adminItems: [], // Todas las convocatorias para administración
    projectsInConvocatoria: [], // Proyectos de una convocatoria específica
    proyectosUsuario: [], // Proyectos de un usuario específico
    docConvocatorias: [], // Documentos de todas las convocatorias
    loading: false,
    adminLoading: false,
    projectsLoading: false,
    docsLoading: false,
    proyectosUsuarioLoading: false,
    error: null,
    adminError: null,
    projectsError: null,
    proyectosUsuarioError: null,
    docsError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpenConvocatorias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpenConvocatorias.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOpenConvocatorias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch All Convocatorias
      .addCase(fetchAllConvocatorias.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAllConvocatorias.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminItems = action.payload;
      })
      .addCase(fetchAllConvocatorias.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      // Create Convocatoria
      .addCase(createConvocatoria.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(createConvocatoria.fulfilled, (state) => {
        state.adminLoading = false;
        // La lista se refresca con fetchAllConvocatorias
      })
      .addCase(createConvocatoria.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      // Toggle Convocatoria Status
      .addCase(toggleConvocatoriaStatus.pending, (state) => {
        state.adminLoading = true; // Podrías tener un loading por fila si quieres
        state.adminError = null;
      })
      .addCase(toggleConvocatoriaStatus.fulfilled, (state) => {
        state.adminLoading = false;
        // La lista se refresca con fetchAllConvocatorias
      })
      .addCase(toggleConvocatoriaStatus.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      // Fetch Projects By Convocatoria
      .addCase(fetchProjectsByConvocatoria.pending, (state) => {
        state.projectsLoading = true;
        state.projectsError = null;
      })
      .addCase(fetchProjectsByConvocatoria.fulfilled, (state, action) => {
        state.projectsLoading = false;
        state.projectsInConvocatoria = action.payload;
      })
      .addCase(fetchProjectsByConvocatoria.rejected, (state, action) => {
        state.projectsLoading = false;
        state.projectsError = action.payload;
      })
      // Fetch DocConvocatorias
      .addCase(fetchDocConvocatorias.pending, (state) => {
        state.docsLoading = true;
        state.docsError = null;
      })
      .addCase(fetchDocConvocatorias.fulfilled, (state, action) => {
        state.docsLoading = false;
        state.docConvocatorias = action.payload;
      })
      .addCase(fetchDocConvocatorias.rejected, (state, action) => {
        state.docsLoading = false;
        state.docsError = action.payload;
      })
      // Create DocConvocatoria
      .addCase(createDocConvocatoria.pending, (state) => {
        state.docsLoading = true;
      })
      .addCase(createDocConvocatoria.fulfilled, (state) => {
        state.docsLoading = false;
      })
      .addCase(createDocConvocatoria.rejected, (state, action) => {
        state.docsLoading = false;
        state.docsError = action.payload;
      })
      // Delete DocConvocatoria
      .addCase(deleteDocConvocatoria.pending, (state) => {
        state.docsLoading = true; // O un loading por fila
      })
      .addCase(deleteDocConvocatoria.fulfilled, (state) => {
        state.docsLoading = false;
      })
      .addCase(deleteDocConvocatoria.rejected, (state, action) => {
        state.docsLoading = false;
        state.docsError = action.payload;
      })
      // Fetch Proyectos Por Usuario
      .addCase(fetchProyectosPorUsuario.pending, (state) => {
        state.proyectosUsuarioLoading = true;
        state.proyectosUsuarioError = null;
      })
      .addCase(fetchProyectosPorUsuario.fulfilled, (state, action) => {
        state.proyectosUsuarioLoading = false;
        state.proyectosUsuario = action.payload;
      })
      .addCase(fetchProyectosPorUsuario.rejected, (state, action) => {
        state.proyectosUsuarioLoading = false;
        state.proyectosUsuarioError = action.payload;
      });
  },
});

export default convocatoriasSlice.reducer;
