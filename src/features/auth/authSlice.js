// e:\PROYECTO_ROSILLO\django_react\react_rosillo\src\features\auth\authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Función asíncrona para el login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('login/', { username, password });
      // Guardar el token en localStorage para persistencia
      localStorage.setItem('authToken', response.data.token);
      return response.data;
    } catch (error) {
      // Manejo de errores del backend
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.error || 'Credenciales inválidas');
      }
      return rejectWithValue(error.message);
    }
  }
);

// Función asíncrona para el logout (si tu backend tiene un endpoint de logout)
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Si tienes un endpoint de logout en Django para invalidar el token
      // await axiosInstance.post('logout/'); 
      localStorage.removeItem('authToken');
      return true;
    } catch (error) {
      // Aunque el logout falle en el backend, en el frontend lo consideramos exitoso
      localStorage.removeItem('authToken');
      return rejectWithValue(error.message);
    }
  }
);

// Función asíncrona para confirmar el restablecimiento de contraseña
export const resetPasswordConfirm = createAsyncThunk(
  'auth/resetPasswordConfirm',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('password-reset/confirm/', { token, password });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.error || 'El enlace de restablecimiento es inválido o ha expirado.');
      }
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('authToken') || null, // Cargar token al iniciar la app
    roles: [],
    isAuthenticated: !!localStorage.getItem('authToken'), // Verificar si hay token
    loading: false,
    error: null,
    resetPasswordSuccess: false, // Nuevo estado para manejar el éxito del reset
  },
  reducers: {
    // Reducer para inicializar el estado de autenticación al cargar la app
    // Esto es útil si quieres cargar el usuario y roles al refrescar la página
    setAuthData: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.roles = action.payload.roles;
      state.isAuthenticated = !!action.payload.token;
    },
    // Reducer para limpiar el estado de autenticación (logout local)
    clearAuthData: (state) => {
      state.user = null;
      state.token = null;
      state.roles = [];
      state.isAuthenticated = false;
      localStorage.removeItem('authToken');
    },
    // Reducer para resetear el estado de éxito del cambio de contraseña
    resetPasswordStatus: (state) => {
      state.resetPasswordSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Manejo del login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = { id: action.payload.user_id, username: action.payload.username };
        state.token = action.payload.token;
        state.roles = action.payload.roles;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.roles = [];
        state.error = action.payload || 'Fallo en el inicio de sesión';
      })
      // Manejo del logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.roles = [];
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Aunque haya un error en el backend, el frontend ya se deslogueó
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.roles = [];
        state.error = action.payload || 'Error al cerrar sesión, pero se deslogueó localmente.';
      })
      // Manejo del reset de contraseña
      .addCase(resetPasswordConfirm.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPasswordConfirm.fulfilled, (state) => {
        state.loading = false;
        state.resetPasswordSuccess = true;
      })
      .addCase(resetPasswordConfirm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAuthData, clearAuthData, resetPasswordStatus } = authSlice.actions;
export default authSlice.reducer;
