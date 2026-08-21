// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// --- LOGIN ---
// LoginView (apps/usuarios/views/auth_views.py) devuelve:
//   { access, refresh, user: {id, username, email}, debe_cambiar_password }
// NO devuelve roles, así que justo después de loguear se pide el perfil
// propio a GET usuarios/me/ (ver MeView) para tener roles disponibles.
//
// 'sistema' ('formal' | 'formativa') es un concepto puramente de frontend:
// el backend no lo conoce. Se guarda para que, tras un refresh de página,
// Navbar y las rutas por defecto sepan a qué dominio volver.
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password, sistema = 'formal' }, { rejectWithValue }) => {
    try {
      // Antes: siempre 'usuarios/login/' (endpoint que ya no existe).
      // Ahora: el endpoint depende del sistema al que se está logueando.
      const endpoint = sistema === 'formativa'
        ? 'usuarios/login/formativa/'
        : 'usuarios/login/formal/';

      const { data: authData } = await axiosInstance.post(endpoint, {
        username,
        password,
      });
      localStorage.setItem('accessToken', authData.access);
      localStorage.setItem('refreshToken', authData.refresh);
      localStorage.setItem('sistemaActivo', sistema);
      const { data: profile } = await axiosInstance.get('usuarios/me/');
      return {
        user: profile,
        access: authData.access,
        refresh: authData.refresh,
        roles: profile.roles,
        facultadId: profile.facultad_id,
        grupoId: profile.grupo_id,
        debeCambiarPassword: authData.debe_cambiar_password,
        sistema,
      };
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.error || 'Credenciales inválidas');
      }
      return rejectWithValue(error.message);
    }
  }
);

// --- RESTAURAR SESIÓN AL RECARGAR LA PÁGINA ---
export const loadSession = createAsyncThunk(
  'auth/loadSession',
  async (_, { rejectWithValue }) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return rejectWithValue('Sin sesión activa');
    }
    try {
      const { data: profile } = await axiosInstance.get('usuarios/me/');
      return {
        user: profile,
        access: accessToken,
        refresh: localStorage.getItem('refreshToken'),
        roles: profile.roles,
        facultadId: profile.facultad_id,
        grupoId: profile.grupo_id,
        debeCambiarPassword: profile.debe_cambiar_password,
        sistema: localStorage.getItem('sistemaActivo') || 'formal',
      };
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sistemaActivo');
      return rejectWithValue('Sesión inválida o expirada');
    }
  }
);

// --- LOGOUT ---
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await axiosInstance.post('usuarios/logout/', { refresh: refreshToken });
      }
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sistemaActivo');
    }
  }
);

// --- CAMBIAR CONTRASEÑA (usuario autenticado, con o sin debe_cambiar_password) ---
// PasswordViewSet.change_password (usuarios/password/change-password/) exige
// old_password + new_password y ya limpia debe_cambiar_password en el backend;
// acá solo replicamos ese estado en el redux local para que PrivateRoute deje
// de redirigir sin necesidad de otro roundtrip a usuarios/me/.
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ old_password, new_password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('usuarios/password/change-password/', {
        old_password,
        new_password,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

const initialState = {
  user: null,
  roles: [],
  isAuthenticated: !!localStorage.getItem('accessToken'),
  debeCambiarPassword: false,
  sistemaActivo: localStorage.getItem('sistemaActivo') || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthData: (state) => {
      state.user = null;
      state.roles = [];
      state.facultadId = null;
      state.grupoId = null;
      state.isAuthenticated = false;
      state.debeCambiarPassword = false;
      state.sistemaActivo = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sistemaActivo');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.roles = action.payload.roles;
        state.debeCambiarPassword = action.payload.debeCambiarPassword;
        state.sistemaActivo = action.payload.sistema;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.error = action.payload || 'Fallo en el inicio de sesión';
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.debeCambiarPassword = false;
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.roles = action.payload.roles;
        state.facultadId = action.payload.facultadId;
        state.grupoId = action.payload.grupoId;
        state.debeCambiarPassword = action.payload.debeCambiarPassword;
        state.sistemaActivo = action.payload.sistema;
      })
      .addCase(loadSession.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.facultadId = null;
        state.grupoId = null;
        state.sistemaActivo = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.debeCambiarPassword = false;
        state.sistemaActivo = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.facultadId = null;
        state.grupoId = null;
      });
  },
});

export const { clearAuthData } = authSlice.actions;
export default authSlice.reducer;