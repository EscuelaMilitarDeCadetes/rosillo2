import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunk para obtener los usuarios con roles de plataforma
export const fetchPlatformUsers = createAsyncThunk(
  'users/fetchPlatformUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('roles-x-usuario/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Thunk para obtener las personas en grupos/facultades
export const fetchGroupUsers = createAsyncThunk(
  'users/fetchGroupUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('personas-x-grupo/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Thunk para crear un nuevo usuario (persona, usuario, y relaciones)
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      // Tu `UsuarioViewSet.create` en Django ya está preparado para esta lógica
      const response = await axiosInstance.post('usuarios/', userData);
      // Después de crear, volvemos a cargar las listas para que se actualicen
      dispatch(fetchPlatformUsers());
      dispatch(fetchGroupUsers());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al crear el usuario.');
    }
  }
);

// Thunk para agregar un nuevo rol a un usuario
export const addRoleToUser = createAsyncThunk(
  'users/addRoleToUser',
  async (roleData, { dispatch, rejectWithValue }) => {
    try {
      // Asumimos que tienes un endpoint en Django para esto, ej. /api/roles-x-usuario/
      const response = await axiosInstance.post('roles-x-usuario/', roleData);
      // Después de agregar, volvemos a cargar la lista de usuarios de plataforma para ver el cambio
      dispatch(fetchPlatformUsers());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al agregar el rol.');
    }
  }
);

// Thunk para asignar una persona a un grupo/facultad como investigador
export const assignResearcher = createAsyncThunk(
  'users/assignResearcher',
  async (assignmentData, { dispatch, rejectWithValue }) => {
    try {
      // El endpoint para crear una relación PersonaXGrupo
      const response = await axiosInstance.post('personas-x-grupo/', assignmentData);
      // Después de asignar, volvemos a cargar la lista para ver el nuevo registro
      dispatch(fetchGroupUsers());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al asignar el investigador.');
    }
  }
);

// Thunk para obtener los roles de un usuario específico
export const fetchRolesForUser = createAsyncThunk(
  'users/fetchRolesForUser',
  async (userId, { rejectWithValue }) => {
    try {
      // Asumimos que tu API puede filtrar roles por usuario, ej: /api/roles-x-usuario/?usuario_id=123
      const response = await axiosInstance.get(`roles-x-usuario/?usuario=${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue('Error al cargar los roles del usuario.');
    }
  }
);

// Thunk para borrar un rol de un usuario (eliminar una instancia de RolXUsuario)
export const deleteRoleFromUser = createAsyncThunk(
  'users/deleteRoleFromUser',
  async (rolXUsuarioId, { dispatch, rejectWithValue }) => {
    try {
      // El endpoint para borrar una relación RolXUsuario por su ID
      await axiosInstance.delete(`roles-x-usuario/${rolXUsuarioId}/`);
      // Después de borrar, volvemos a cargar la lista para ver el cambio
      dispatch(fetchPlatformUsers());
      return rolXUsuarioId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al borrar el rol.');
    }
  }
);

// Thunk para obtener todas las asignaciones de investigadores a proyectos
export const fetchInvestigatorAssignments = createAsyncThunk(
  'users/fetchInvestigatorAssignments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('investigadores-x-proyecto/');
      return response.data;
    } catch (error) {
      return rejectWithValue('Error al cargar las asignaciones de investigadores.');
    }
  }
);

// Thunk para activar/desactivar un usuario
export const toggleUserStatus = createAsyncThunk(
  'users/toggleUserStatus',
  async (userId, { rejectWithValue }) => {
    try {
      // Tu API de Django tiene una acción personalizada para esto
      const response = await axiosInstance.post(`usuarios/${userId}/toggle_active/`);
      return { userId, ...response.data }; // Devuelve el ID y la respuesta para actualizar el estado
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    platformUsers: [],
    groupUsers: [],
    investigatorAssignments: [],
    userRoles: [], // Nuevo estado para guardar los roles del usuario seleccionado
    loading: false,
     // Añadimos un estado de carga específico para acciones en filas
    rowLoading: {
      // Ejemplo: { 'userId123': true }
    },
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Platform Users
      .addCase(fetchPlatformUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatformUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.platformUsers = action.payload;
      })
      .addCase(fetchPlatformUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Role to User
      .addCase(addRoleToUser.pending, (state) => {
        state.loading = true; // O un estado de carga específico del modal
      })
      .addCase(addRoleToUser.fulfilled, (state) => {
        state.loading = false;
        // El estado se actualizará con el fetchPlatformUsers despachado en el thunk
      })
      .addCase(addRoleToUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Assign Researcher
      .addCase(assignResearcher.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignResearcher.fulfilled, (state) => {
        state.loading = false;
        // El estado se actualizará con el fetchGroupUsers despachado en el thunk
      })
      .addCase(assignResearcher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Roles for User
      .addCase(fetchRolesForUser.pending, (state) => {
        state.loading = true; // O un estado de carga específico
        state.userRoles = []; // Limpiar la lista anterior
      })
      .addCase(fetchRolesForUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userRoles = action.payload;
      })
      .addCase(fetchRolesForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Role from User
      .addCase(deleteRoleFromUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRoleFromUser.fulfilled, (state) => {
        state.loading = false;
        // La lista se actualizará con el fetchPlatformUsers despachado en el thunk
        state.userRoles = []; // Limpiar la lista de roles del modal
      })
      .addCase(deleteRoleFromUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Group Users
      .addCase(fetchGroupUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroupUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.groupUsers = action.payload;
      })
      .addCase(fetchGroupUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true; // Podríamos usar un estado de carga específico para el modal
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
        // El estado se actualizará con los fetchs que se despachan en el thunk
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle User Status
      .addCase(toggleUserStatus.pending, (state, action) => {
        state.rowLoading[action.meta.arg] = true; // Pone en carga la fila específica por ID
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.rowLoading[userId] = false;
        // Actualiza el estado del usuario en la lista sin necesidad de volver a cargar todo
        const userIndex = state.platformUsers.findIndex(u => u.usuario.id === userId);
        if (userIndex !== -1) {
          state.platformUsers[userIndex].usuario.estado = !state.platformUsers[userIndex].usuario.estado;
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.rowLoading[action.meta.arg] = false;
        state.error = action.payload; // Puedes manejar este error en un toast/notificación
      })
      // Fetch Investigator Assignments
      .addCase(fetchInvestigatorAssignments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvestigatorAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.investigatorAssignments = action.payload;
      })
      .addCase(fetchInvestigatorAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });      
  },
});



export default usersSlice.reducer;
