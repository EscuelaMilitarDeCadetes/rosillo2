// src/features/convocatorias/convocatoriasSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Módulo real: api/investigacion-formal/ (config/urls.py).
// El router registra 'convocatorias' -> ConvocatoriaViewSet, con acciones
// internas/, externas/, activas/ y {id}/cambiar-estado/ (PATCH).
// Antes se llamaba 'convocatorias-internas/' a secas, que no existe.
const BASE = 'investigacion-formal/convocatorias/';

// Obtiene una convocatoria puntual (ConvocatoriaViewSet.retrieve).
export const fetchConvocatoria = createAsyncThunk(
  'convocatorias/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Error al cargar la convocatoria.');
    }
  }
);

// POST .../convocatorias/{id}/participar/ -> ProyectoXConvocatoriaService.participar_convocatoria()
export const createProyecto = createAsyncThunk(
  'convocatorias/createProyecto',
  async ({ convocatoriaId, data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('titulo', data.titulo);
      formData.append('alianza', data.alianza);
      formData.append('financiado', data.financiado);
      formData.append('unidad_ejecutora', data.unidadEjecutora);
      formData.append('linea_investigacion', data.lineaInvestigacion);
      formData.append('valor_solicitado', data.valorSolicitado || 0);
      formData.append('doc_proyecto', data.docProyecto);
      if (data.docCarta) formData.append('doc_carta', data.docCarta);
      if (data.docAlianza) formData.append('doc_alianza', data.docAlianza);
      const response = await axiosInstance.post(`${BASE}${convocatoriaId}/participar/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al participar en la convocatoria.');
    }
  }
);

export const fetchOpenConvocatorias = createAsyncThunk(
  'convocatorias/fetchOpen',
  async (_, { rejectWithValue }) => {
    try {
      // internas/ SIEMPRE pagina en servidor ({count, next, previous, results}).
      // ConvocatoriasAbiertasTable pagina en CLIENTE sobre el arreglo completo
      // (no usa `lazy`), así que se pide una página grande (mismo patrón que
      // metadataSlice.SIN_PAGINAR) y se devuelve solo `results`, nunca el
      // objeto de paginación completo.
      const response = await axiosInstance.get(`${BASE}internas/`, {
        params: { estado: true, page_size: 200 },
      });
      return response.data.results ?? [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las convocatorias");
    }
  }
);

// Vista de administración: todas las internas, sin filtrar por estado
// (así se comportaba adminConvocatoria.html originalmente).
export const fetchAllConvocatorias = createAsyncThunk(
  'convocatorias/fetchAll',
  async ({ page = 1, rows = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE}internas/`, {
        params: { page, page_size: rows },
      });
      return { results: response.data.results, count: response.data.count, page, rows };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar las convocatorias internas");
    }
  }
);

// El modelo Convocatoria finalizado NO tiene campo de documento
// (nombre_convocatoria, anio_convocatoria, inicio, cierre, estado, interno),
// y ConvocatoriaViewSet.create no acepta multipart. Se envía JSON plano.
export const createConvocatoria = createAsyncThunk(
  'convocatorias/create',
  async (convocatoriaData, { dispatch, rejectWithValue }) => {
    try {
      const formatDate = (d) => {
        const date = new Date(d);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };
      const formData = new FormData();
      formData.append('nombre_convocatoria', convocatoriaData.nombre_convocatoria);
      formData.append('anio_convocatoria', convocatoriaData.anio_convocatoria);
      formData.append('inicio', formatDate(convocatoriaData.inicio));
      formData.append('cierre', formatDate(convocatoriaData.cierre));
      formData.append('archivo', convocatoriaData.documento_file, convocatoriaData.documento_file.name);
      const response = await axiosInstance.post(BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(fetchAllConvocatorias());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.archivo || "Error al crear la convocatoria.");
    }
  }
);

// ConvocatoriaViewSet.cambiar_estado es PATCH a {id}/cambiar-estado/ y
// espera el nuevo estado en el body (no es un simple "toggle" sin body).
export const toggleConvocatoriaStatus = createAsyncThunk(
  'convocatorias/toggleStatus',
  async ({ id, estado }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${BASE}${id}/cambiar-estado/`, { estado });
      dispatch(fetchAllConvocatorias());
      return { convocatoriaId: id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Error al cambiar el estado de la convocatoria.");
    }
  }
);

// ProyectoXConvocatoriaViewSet expone 'por-convocatoria/{id}/' como segmento
// de ruta, no como query param ?convocatoria_id=.
export const fetchProjectsByConvocatoria = createAsyncThunk(
  'convocatorias/fetchProjectsByConvocatoria',
  async (convocatoriaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `investigacion-formal/proyecto-convocatoria/por-convocatoria/${convocatoriaId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar los proyectos de la convocatoria.");
    }
  }
);

// apps/investigacion_formal/views/proyecto_x_convocatoria_viewset.py ->
// GET investigacion-formal/proyecto-convocatoria/mis-proyectos/ (nueva acción,
// filtra por proyecto__usuario_id=request.user directamente en el backend).
export const fetchProyectosPorUsuario = createAsyncThunk(
  "convocatorias/fetchProyectosPorUsuario",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        "investigacion-formal/proyecto-convocatoria/mis-proyectos/"
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error al cargar tus proyectos.");
    }
  }
);

// Paso 4: descarga del documento adjunto de la convocatoria.
// Convocatoria no tiene el documento como campo propio: se busca vía
// DocumentoFirmaViewSet.por_objeto (content_type_app_label/content_type_model/object_id)
// y luego se descarga vía DocumentoFirmaViewSet.descargar ({id}/descargar/).
// La descarga se hace como blob (no window.open) porque el backend exige
// JWT por header "Authorization: Bearer <token>", que un GET de navegador
// simple (window.open) no envía.
export const descargarDocumentoConvocatoria = createAsyncThunk(
  'convocatorias/descargarDocumento',
  async (convocatoriaId, { rejectWithValue }) => {
    try {
      const porObjeto = await axiosInstance.get('common/documento-firma/por-objeto/', {
        params: {
          content_type_app_label: 'investigacion_formal',
          content_type_model: 'convocatoria',
          object_id: convocatoriaId,
        },
      });
      const documentos = porObjeto.data;
      if (!documentos || documentos.length === 0) {
        return rejectWithValue('Esta convocatoria no tiene un documento adjunto registrado.');
      }
      const documentoId = documentos[0].id;
      const response = await axiosInstance.get(`common/documento-firma/${documentoId}/descargar/`, {
        responseType: 'blob',
      });
      const disposition = response.headers['content-disposition'];
      let filename = 'documento-convocatoria';
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { convocatoriaId };
    } catch (error) {
      return rejectWithValue('No se pudo descargar el documento de la convocatoria.');
    }
  }
);

// common/documento-firma/ (DocumentoFirmaViewSet.create) acepta un objeto
// genérico vía content_type_app_label/content_type_model/object_id — aquí
// apuntando al Proyecto. Reemplaza a la función rota
// "Cargue documento corregido" del userConvocatoria.html original.
export const subirDocumentoCorregidoProyecto = createAsyncThunk(
  'convocatorias/subirDocumentoCorregido',
  async ({ proyectoId, tipoDocumentoId, archivo }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('content_type_app_label', 'investigacion_formal');
      formData.append('content_type_model', 'proyecto');
      formData.append('object_id', proyectoId);
      formData.append('tipo_documento', tipoDocumentoId);
      formData.append('archivo', archivo, archivo.name);
      // 'ENTREGADO' no existe en DocumentoFirma.ESTADO_CHOICES (BORRADOR,
      // EN_FIRMAS, RECHAZADO, FIRMADO) -> DocumentoFirmaValidator._validar_estado()
      // rechazaba TODO envío con 400. Se omite el campo y se deja que
      // DocumentoFirmaViewSet.create() aplique su default real: 'BORRADOR'.
      const response = await axiosInstance.post('common/documento-firma/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(fetchProyectosPorUsuario());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      return rejectWithValue(
        typeof data === 'string' ? data : data?.error || 'Error al subir el documento corregido.'
      );
    }
  }
);


const convocatoriasSlice = createSlice({
  name: 'convocatorias',
  initialState: {
    items: [],
    convocatoriaActual: null,
    adminItems: [],
    adminTotalRecords: 0,
    adminPage: 1,
    adminRows: 20,
    projectsInConvocatoria: [],
    proyectosUsuario: [],
    loading: false,
    adminLoading: false,
    projectsLoading: false,
    proyectosUsuarioLoading: false,
    error: null,
    adminError: null,
    projectsError: null,
    proyectosUsuarioError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpenConvocatorias.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOpenConvocatorias.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchOpenConvocatorias.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchAllConvocatorias.pending, (state) => { state.adminLoading = true; state.adminError = null; })
      .addCase(fetchAllConvocatorias.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminItems = action.payload.results;
        state.adminTotalRecords = action.payload.count;
        state.adminPage = action.payload.page;
        state.adminRows = action.payload.rows;
      })
      .addCase(fetchAllConvocatorias.rejected, (state, action) => { state.adminLoading = false; state.adminError = action.payload; })
      .addCase(createConvocatoria.pending, (state) => { state.adminLoading = true; state.adminError = null; })
      .addCase(createConvocatoria.fulfilled, (state) => { state.adminLoading = false; })
      .addCase(createConvocatoria.rejected, (state, action) => { state.adminLoading = false; state.adminError = action.payload; })
      .addCase(toggleConvocatoriaStatus.pending, (state) => { state.adminLoading = true; state.adminError = null; })
      .addCase(toggleConvocatoriaStatus.fulfilled, (state) => { state.adminLoading = false; })
      .addCase(toggleConvocatoriaStatus.rejected, (state, action) => { state.adminLoading = false; state.adminError = action.payload; })
      .addCase(fetchProjectsByConvocatoria.pending, (state) => { state.projectsLoading = true; state.projectsError = null; })
      .addCase(fetchProjectsByConvocatoria.fulfilled, (state, action) => { state.projectsLoading = false; state.projectsInConvocatoria = action.payload; })
      .addCase(fetchProjectsByConvocatoria.rejected, (state, action) => { state.projectsLoading = false; state.projectsError = action.payload; })
      .addCase(fetchProyectosPorUsuario.pending, (state) => { state.proyectosUsuarioLoading = true; state.proyectosUsuarioError = null; })
      .addCase(fetchProyectosPorUsuario.fulfilled, (state, action) => { state.proyectosUsuarioLoading = false; state.proyectosUsuario = action.payload; })
      .addCase(fetchProyectosPorUsuario.rejected, (state, action) => { state.proyectosUsuarioLoading = false; state.proyectosUsuarioError = action.payload; })
      .addCase(subirDocumentoCorregidoProyecto.pending, (state) => { state.proyectosUsuarioLoading = true; })
      .addCase(subirDocumentoCorregidoProyecto.fulfilled, (state) => { state.proyectosUsuarioLoading = false; })
      .addCase(subirDocumentoCorregidoProyecto.rejected, (state, action) => { state.proyectosUsuarioLoading = false; state.proyectosUsuarioError = action.payload; })
      .addCase(fetchConvocatoria.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchConvocatoria.fulfilled, (state, action) => { state.loading = false; state.convocatoriaActual = action.payload; })
      .addCase(fetchConvocatoria.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createProyecto.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createProyecto.fulfilled, (state) => { state.loading = false; })
      .addCase(createProyecto.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});
export default convocatoriasSlice.reducer;