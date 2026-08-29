// src/features/proyectos/productosSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const BASE = "investigacion-formal/productos-proyecto/";


// Thunk para obtener los productos de un proyecto específico
export const fetchProductosPorProyecto = createAsyncThunk(
  "proyectos/fetchProductosPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${BASE}por-proyecto/${proyectoId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los productos."
      );
    }
  }
);

// Thunk para agregar un producto al proyecto
export const addProductoProyecto = createAsyncThunk(
  "productos/addProductoProyecto",
  async ({ proyectoId, data }, { dispatch, rejectWithValue }) => {
    try {
      const payload = {
        proyecto: proyectoId,
        producto_x_grupo: data.producto_x_grupo,
        categoria: data.categoria,
        puntaje: data.puntaje,
        activo: true,
        entregado: false,
        gruplac: false,
      };
      await axiosInstance.post(BASE, payload);
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
  async ({ productoXProyectoId, proyectoId }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(
        `${BASE}${productoXProyectoId}/`
      );
      dispatch(fetchProductosPorProyecto(proyectoId));
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
      const response = await axiosInstance.patch(
        `${BASE}${productoXProyectoId}/subir-gruplac/`
      );
      dispatch(fetchProductosPorProyecto(response.data.proyecto));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al subir el producto a GrupLAC."
      );
    }
  }
);

// Thunk para registrar la entrega de un producto (adjuntar documento/link y marcarlo como entregado)
export const registrarEntregaProducto = createAsyncThunk(
  "proyectos/registrarEntregaProducto",
  async ({ productoXProyectoId, proyectoId, documento, tipoDocumentoId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${BASE}${productoXProyectoId}/registrar-entrega/`,
        { documento, tipo_documento: tipoDocumentoId }
      );
      dispatch(fetchProductosPorProyecto(proyectoId));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al registrar la entrega del producto.";
      return rejectWithValue(mensaje);
    }
  }
);

// Thunk para obtener solo los productos pendientes de entrega de un proyecto
export const fetchProductosPendientesPorProyecto = createAsyncThunk(
  "proyectos/fetchProductosPendientesPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${BASE}pendientes/${proyectoId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los productos pendientes."
      );
    }
  }
);

// Thunk para obtener solo los productos ya entregados de un proyecto
export const fetchProductosEntregadosPorProyecto = createAsyncThunk(
  "proyectos/fetchProductosEntregadosPorProyecto",
  async (proyectoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${BASE}entregados/${proyectoId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Error al cargar los productos entregados."
      );
    }
  }
);

const productosSlice = createSlice({
  name: "productos",
  initialState: {
    productos: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchProductosPendientesPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductosPendientesPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.productos = action.payload;
      })
      .addCase(fetchProductosPendientesPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductosEntregadosPorProyecto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductosEntregadosPorProyecto.fulfilled, (state, action) => {
        state.loading = false;
        state.productos = action.payload;
      })
      .addCase(fetchProductosEntregadosPorProyecto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
      .addCase(registrarEntregaProducto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registrarEntregaProducto.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registrarEntregaProducto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default productosSlice.reducer;