// src/features/proyectos/projectsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

import { format } from "date-fns";

// Thunk para obtener proyectos con sus montos
export const fetchProjectsWithBudgets = createAsyncThunk(
  "projects/fetchWithBudgets",
  async (_, { rejectWithValue }) => {
    try {
      // Asumimos que tu API de montos devuelve los detalles del proyecto anidados
      const response = await axiosInstance.get("montos/");
      return response.data;
    } catch (error) {
      return rejectWithValue("Error al cargar los presupuestos.");
    }
  }
);

// Thunk para actualizar un monto
export const updateBudget = createAsyncThunk(
  "projects/updateBudget",
  async ({ montoId, data }, { dispatch, rejectWithValue }) => {
    try {
      // Usamos la acción personalizada que creamos en MontoViewSet
      const response = await axiosInstance.post(
        `montos/${montoId}/asignar-aprobado/`,
        data
      );
      dispatch(fetchProjectsWithBudgets()); // Refrescar la lista
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al actualizar el monto."
      );
    }
  }
);

// Thunk para obtener una lista filtrada de proyectos (reemplaza todas las vistas de listado)
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Construye los parámetros de la URL a partir del objeto de filtros
      const params = new URLSearchParams(filters).toString();
      const response = await axiosInstance.get(`proyectos-x-convocatoria/?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue('Error al cargar los proyectos.');
    }
  }
);

// Thunk para obtener los detalles de un proyecto específico
export const fetchProyecto = createAsyncThunk(
  "proyectos/fetchProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`proyectos/${proyectoId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar el proyecto."
      );
    }
  }
);

// Thunk para obtener los investigadores de un proyecto específico
export const fetchInvestigadoresPorProyecto = createAsyncThunk(
  "proyectos/fetchInvestigadoresPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `investigadores-x-proyecto/?proyecto=${proyectoId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los investigadores."
      );
    }
  }
);

// Thunk para obtener los objetivos de un proyecto específico
export const fetchObjetivosPorProyecto = createAsyncThunk(
  "proyectos/fetchObjetivosPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `objetivos/?proyecto=${proyectoId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los objetivos."
      );
    }
  }
);

// Thunk para obtener los productos de un proyecto específico
export const fetchProductosPorProyecto = createAsyncThunk(
  "proyectos/fetchProductosPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `productos-x-proyecto/?proyecto=${proyectoId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los productos."
      );
    }
  }
);

// --- Documentos del proyecto (DocumentoFirma vía GenericForeignKey) ---
// Migración real: DocumentoXProyecto (Spring) -> DocumentoFirma (common),
// Ver documento_firma_service.py / documento_firma_viewset.py.
// Thunk para obtener los documentos de un proyecto específico
export const fetchDocumentosPorProyecto = createAsyncThunk(
  "proyectos/fetchDocumentosPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        "common/documento-firma/por-objeto/",
        {
          params: {
            content_type_app_label: "investigacion_formal",
            content_type_model: "proyecto",
            object_id: proyectoId,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los documentos."
      );
    }
  }
);

// Thunk para obtener los gastos de un proyecto específico
export const fetchGastosPorProyecto = createAsyncThunk(
  "proyectos/fetchGastosPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      // Asumimos que puedes obtener los gastos a través del monto del proyecto
      const response = await axiosInstance.get(
        `ejecuciones/?monto__proyecto=${proyectoId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los gastos."
      );
    }
  }
);

// Thunk para obtener el monto de un proyecto específico
export const fetchMontoPorProyecto = createAsyncThunk(
  "proyectos/fetchMontoPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `montos/?proyecto=${proyectoId}`
      );
      // Asumimos que devuelve una lista, tomamos el primero
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar el monto."
      );
    }
  }
);

// Thunk para actualizar la fecha de cierre del proyecto
export const updateProjectDates = createAsyncThunk(
  "proyectos/updateProjectDates",
  async ({ proyectoId, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `proyectos/${proyectoId}/asignar-fechas/`,
        data
      );
      dispatch(fetchProyecto(proyectoId)); // Refrescar el proyecto
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          "Error al actualizar las fechas del proyecto."
      );
    }
  }
);

// Thunk para subir proyecto a GrupLAC
export const uploadProjectToGruplac = createAsyncThunk(
  "proyectos/uploadProjectToGruplac",
  async (proyectoId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `proyectos/${proyectoId}/subir-a-gruplac/`
      );
      dispatch(fetchProyecto(proyectoId)); // Refrescar el proyecto
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al subir el proyecto a GrupLAC."
      );
    }
  }
);

// Thunk para agregar un documento al proyecto
export const addDocumentoProyecto = createAsyncThunk(
  "proyectos/addDocumentoProyecto",
  async ({ proyectoId, data }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("content_type_app_label", "investigacion_formal");
      formData.append("content_type_model", "proyecto");
      formData.append("object_id", proyectoId);
      formData.append("tipo_documento", data.tipo_documento);
      formData.append("archivo", data.documento_file, data.documento_file.name);
      // Sin 'estado': el backend lo pone en BORRADOR por defecto
      // (DocumentoFirmaViewSet.create -> request.data.get('estado', 'BORRADOR')).
      await axiosInstance.post("common/documento-firma/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchDocumentosPorProyecto(proyectoId));
      return true;
    } catch (error) {
      const errData = error.response?.data;
      return rejectWithValue(
        typeof errData === "string"
          ? errData
          : errData?.error || "Error al agregar el documento."
      );
    }
  }
);

// Thunk para borrar un documento del proyecto
export const deleteDocumentoProyecto = createAsyncThunk(
  "proyectos/deleteDocumentoProyecto",
  async ({ documentoId, proyectoId }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`common/documento-firma/${documentoId}/`);
      // A diferencia del original, sí recargamos: DocumentosProyectoTable
      // reconstruye la lista combinando "requeridos" + "existentes" en cada
      // fetch, no solo filtra localmente por id.
      dispatch(fetchDocumentosPorProyecto(proyectoId));
      return documentoId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al borrar el documento."
      );
    }
  }
);

// Thunk para agregar un producto al proyecto
export const addProductoProyecto = createAsyncThunk(
  "proyectos/addProductoProyecto",
  async ({ proyectoId, data }, { dispatch, rejectWithValue }) => {
    try {
      const payload = {
        proyecto: proyectoId,
        producto_x_grupo: data.producto_x_grupo, // ID del ProductoXGrupo
        categoria: data.categoria,
        puntaje: data.puntaje,
        activo: true,
        entregado: false, // Inicialmente no entregado
        gruplac: false,
      };
      await axiosInstance.post("productos-x-proyecto/", payload);
      dispatch(fetchProductosPorProyecto(proyectoId));
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al agregar el producto."
      );
    }
  }
);

// Thunk para borrar un producto del proyecto
export const deleteProductoProyecto = createAsyncThunk(
  "proyectos/deleteProductoProyecto",
  async (productoXProyectoId, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(
        `productos-x-proyecto/${productoXProyectoId}/`
      );
      dispatch(fetchProductosPorProyecto(productoXProyectoId));
      return productoXProyectoId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al borrar el producto."
      );
    }
  }
);

// Thunk para subir un producto a GrupLAC
export const uploadProductoToGruplac = createAsyncThunk(
  "proyectos/uploadProductoToGruplac",
  async (productoXProyectoId, { dispatch, rejectWithValue }) => {
    try {
      // Asumimos que tienes un endpoint para esto, ej: /api/productos-x-proyecto/123/subir-a-gruplac/
      const response = await axiosInstance.post(
        `productos-x-proyecto/${productoXProyectoId}/subir-a-gruplac/`
      );
      dispatch(fetchProductosPorProyecto(response.data.proyecto)); // Refrescar productos del proyecto
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al subir el producto a GrupLAC."
      );
    }
  }
);

// Thunk para agregar un gasto
export const addGasto = createAsyncThunk(
  "proyectos/addGasto",
  async ({ proyectoId, data }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("monto", data.montoId); // ID del monto asociado al proyecto
      formData.append("tipo_rubro", data.tipo_rubro);
      formData.append("nombre", data.nombre);
      formData.append("costo", data.costo);
      formData.append("descripcion", data.descripcion);
      formData.append(
        "documento_file",
        data.documento_file,
        data.documento_file.name
      );

      await axiosInstance.post("ejecuciones/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchGastosPorProyecto(proyectoId)); // Refrescar la lista de gastos
      dispatch(fetchMontoPorProyecto(proyectoId)); // Refrescar el monto para actualizar ejecutado
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al agregar el gasto."
      );
    }
  }
);

// Thunk para borrar un documento de presupuesto
export const deleteDocumentoPresupuesto = createAsyncThunk(
  "proyectos/deleteDocumentoPresupuesto",
  async ({ documentoId, proyectoId }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`documentos-x-presupuesto/${documentoId}/`);
      dispatch(fetchGastosPorProyecto(proyectoId)); // Refrescar la lista de gastos
      return documentoId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          "Error al borrar el documento de presupuesto."
      );
    }
  }
);

// Thunk para borrar una ejecución (gasto)
export const deleteEjecucion = createAsyncThunk(
  "proyectos/deleteEjecucion",
  async ({ ejecucionId, proyectoId }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`ejecuciones/${ejecucionId}/`);
      dispatch(fetchGastosPorProyecto(proyectoId)); // Refrescar la lista de gastos
      dispatch(fetchMontoPorProyecto(proyectoId)); // Refrescar el monto para actualizar ejecutado
      return ejecucionId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al borrar la ejecución."
      );
    }
  }
);

// Catálogo real de tipos de documento de proyecto: TipoDocumento.grupo='proyecto'.
export const fetchTiposDocumentoProyecto = createAsyncThunk(
  "proyectos/fetchTiposDocumentoProyecto",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('common/tipos-documento/por-grupo/', {
        params: { grupo: 'proyecto' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los tipos de documento."
      );
    }
  }
);

// Descarga blob + Bearer (mismo patrón que descargarDocumentoConvocatoria).
export const descargarDocumentoProyecto = createAsyncThunk(
  "proyectos/descargarDocumentoProyecto",
  async (documentoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`common/documento-firma/${documentoId}/descargar/`, {
        responseType: 'blob',
      });
      const disposition = response.headers['content-disposition'];
      let filename = 'documento-proyecto';
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
      return { documentoId };
    } catch (error) {
      return rejectWithValue("No se pudo descargar el documento.");
    }
  }
);


const projectsSlice = createSlice({
  name: "projects",
  initialState: {
    projectsWithBudgets: [],
    filteredProjects: [], // Nuevo estado para la lista de proyectos filtrada
    proyectoActual: null,
    investigadores: [],
    objetivos: [],
    productos: [],
    documentos: [], 
    tiposDocumentoProyecto: [],
    gastos: [],
    montoProyecto: null,
    loadingDocumentos: false, 
    errorDocumentos: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Projects With Budgets
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredProjects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.filteredProjects = [];
      })
      // Fetch Projects With Budgets
      .addCase(fetchProjectsWithBudgets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjectsWithBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.projectsWithBudgets = action.payload;
      })
      .addCase(fetchProjectsWithBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBudget.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBudget.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Proyecto
      .addCase(fetchProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.proyectoActual = action.payload;
      })
      .addCase(fetchProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Investigadores Por Proyecto
      .addCase(fetchInvestigadoresPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestigadoresPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.investigadores = action.payload;
      })
      .addCase(fetchInvestigadoresPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Objetivos Por Proyecto
      .addCase(fetchObjetivosPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchObjetivosPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.objetivos = action.payload;
      })
      .addCase(fetchObjetivosPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Productos Por Proyecto
      .addCase(fetchProductosPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductosPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.productos = action.payload;
      })
      .addCase(fetchProductosPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Documentos Por Proyecto
      .addCase(fetchDocumentosPorProyecto.pending, (state) => {
        state.loadingDocumentos = true;
        state.errorDocumentos = null;
      })
      .addCase(fetchDocumentosPorProyecto.fulfilled, (state, action) => {
        state.loadingDocumentos = false;
        state.documentos = action.payload;
      })
      .addCase(fetchDocumentosPorProyecto.rejected, (state, action) => {
        state.loadingDocumentos = false;
        state.errorDocumentos = action.payload;
      })
      .addCase(fetchTiposDocumentoProyecto.fulfilled, (state, action) => {
        state.tiposDocumentoProyecto = action.payload;
      })
      // Fetch Gastos Por Proyecto
      .addCase(fetchGastosPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGastosPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.gastos = action.payload;
      })
      .addCase(fetchGastosPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Monto Por Proyecto
      .addCase(fetchMontoPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMontoPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.montoProyecto = action.payload;
      })
      .addCase(fetchMontoPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Project Dates, Upload Project to Gruplac, Add Documento, Delete Documento, Add Producto, Delete Producto, Upload Producto to Gruplac, Add Gasto, Delete Documento Presupuesto, Delete Ejecucion
      .addCase(updateProjectDates.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProjectDates.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateProjectDates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadProjectToGruplac.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadProjectToGruplac.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadProjectToGruplac.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addDocumentoProyecto.pending, (state) => { 
        state.loadingDocumentos = true; state.errorDocumentos = null; 
      })
      .addCase(addDocumentoProyecto.fulfilled, (state) => { 
        state.loadingDocumentos = false; 
      })
      .addCase(addDocumentoProyecto.rejected, (state, action) => { 
        state.loadingDocumentos = false; state.errorDocumentos = action.payload; 
      })
      .addCase(deleteDocumentoProyecto.pending, (state) => { 
        state.loadingDocumentos = true; 
      })
      .addCase(deleteDocumentoProyecto.fulfilled, (state, action) => {
        state.loadingDocumentos = false;
        state.documentos = state.documentos.filter((d) => d.id !== action.payload);
      })
      .addCase(deleteDocumentoProyecto.rejected, (state, action) => { 
        state.loadingDocumentos = false; state.errorDocumentos = action.payload; 
      })
      .addCase(addProductoProyecto.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProductoProyecto.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addProductoProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProductoProyecto.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProductoProyecto.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteProductoProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadProductoToGruplac.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadProductoToGruplac.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadProductoToGruplac.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addGasto.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGasto.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addGasto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteDocumentoPresupuesto.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDocumentoPresupuesto.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteDocumentoPresupuesto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteEjecucion.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEjecucion.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteEjecucion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default projectsSlice.reducer;
