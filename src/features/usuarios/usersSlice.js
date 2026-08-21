// src/features/usuarios/usersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { fetchMetadata } from "../metadata/metadataSlice";

/**
 * Thunk para obtener los usuarios con roles de plataforma, con paginación
 * REAL de backend (RolXUsuarioViewSet.list() siempre pagina, nunca devuelve
 * un array plano -> {count, next, previous, results}).
 *
 * IMPORTANTE: este endpoint no soporta ningún parámetro de búsqueda/orden
 * (revisar apps/usuarios/views/rol_x_usuario_viewset.py -> list()); por eso
 * NO se expone un `search` aquí. Si se necesita búsqueda real sobre todo el
 * dataset (no solo la página cargada), hay que añadir soporte de `search` en
 * el backend primero — queda pendiente, no se asume que ya existe.
 *
 * `arg` = { page = 1, pageSize = 10 }
 */
export const fetchPlatformUsers = createAsyncThunk(
  "users/fetchPlatformUsers",
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      // apps/usuarios/urls.py -> router.register(r'roles-usuario', RolXUsuarioViewSet)
      const response = await axiosInstance.get("usuarios/roles-usuario/", {
        params: { page, page_size: pageSize },
      });
      return response.data; // { count, next, previous, results }
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

/**
 * Thunk para obtener las personas en grupos/facultades, con paginación real
 * de backend (PersonaXGrupoViewSet.list() también pagina siempre).
 * Mismo caso: el backend no soporta `search` todavía (ver
 * apps/institucional/views/persona_x_grupo_viewset.py -> list()).
 *
 * `arg` = { page = 1, pageSize = 10 }
 */
export const fetchGroupUsers = createAsyncThunk(
  "users/fetchGroupUsers",
  async ({ page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      // apps/institucional/urls.py -> router.register(r'persona-grupo', PersonaXGrupoViewSet)
      const response = await axiosInstance.get("institucional/persona-grupo/", {
        params: { page, page_size: pageSize },
      });
      return response.data; // { count, next, previous, results }
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

/**
 * Thunk para crear un nuevo usuario a través de VinculacionViewSet
 * (apps/integracion). El backend NO tiene un único endpoint genérico de
 * creación: son 12 endpoints, uno por rol de plataforma
 * (POST /api/integracion/crear-<tipo>/), cada uno con su propia validación
 * de campos obligatorios (ver VinculacionValidator).
 *
 * `arg` = { endpoint: string, payload: object }
 *   - endpoint: sufijo del tipo (p. ej. 'crear-soporte', 'crear-decano'...),
 *     ver features/usuarios/tipos_usuario_soporte.js -> TIPOS_USUARIO_SOPORTE.
 *   - payload: datos de la Persona + rol_plataforma_id (+ facultad_id o
 *     grupo_id + rol_grupo_id según el flujo). NO incluir username/password:
 *     el backend los autogenera (VinculacionService._crear_usuario) y
 *     programa el envío de credenciales por correo.
 */
export const createUser = createAsyncThunk(
  "users/createUser",
  async ({ endpoint, payload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `integracion/${endpoint}/`,
        payload,
      );
      // Después de crear, volvemos a cargar las listas para que se actualicen
      dispatch(fetchPlatformUsers());
      dispatch(fetchGroupUsers());
      return response.data;
    } catch (error) {
      // VinculacionValidator devuelve errores como {campo: "mensaje"} (400) en
      // vez de {error: "mensaje"}; cubrimos ambas formas para no perder el detalle.
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : data?.error ||
            (data && Object.values(data).flat().join(" ")) ||
            "Error al crear el usuario.";
      return rejectWithValue(mensaje);
    }
  },
);

/**
 * Thunk para agregar un nuevo rol de plataforma a un usuario.
 *
 * apps/usuarios/views/rol_x_usuario_viewset.py -> @action(detail=False,
 * methods=['post'], url_path='agregar-rol') -> RolXUsuarioService
 * .agregar_rol_a_usuario(usuario_id, rol_id, ejecutor). Solo necesita
 * usuario_id y rol_id: NO existe facultad/grupo/vinculación en este flujo
 * (eso es un concepto distinto -> PersonaXGrupo, ver assignResearcher).
 *
 * `arg` = { usuario_id, rol_id }
 */
export const addRoleToUser = createAsyncThunk(
  "users/addRoleToUser",
  async ({ usuario_id, rol_id }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "usuarios/roles-usuario/agregar-rol/",
        {
          usuario_id,
          rol_id,
        },
      );
      dispatch(fetchPlatformUsers());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al agregar el rol.",
      );
    }
  },
);

/**
 * Thunk para editar un rol de plataforma existente (nombre_rol y/o
 * descripcion). apps/usuarios/views/rol_plataforma_viewset.py -> update()
 * (PATCH /usuarios/roles/{id}/, acepta parcial).
 *
 * `arg` = { id, nombre_rol?, descripcion? }
 */
export const updateRole = createAsyncThunk(
  "users/updateRole",
  async ({ id, ...cambios }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `usuarios/roles/${id}/`,
        cambios,
      );
      // Los dropdowns de NewUserModal/AddRoleModal/DeleteRoleModal leen
      // metadata.roles, así que hay que refrescar ese slice, no el de users.
      dispatch(fetchMetadata());
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : (data && Object.values(data).flat().join(" ")) ||
            "Error al editar el rol.";
      return rejectWithValue(mensaje);
    }
  },
);

// Thunk para asignar una persona a un grupo/facultad como investigador
// apps/institucional/views/persona_x_grupo_viewset.py -> create() ->
// PersonaXGrupoService.crear(persona_id, rol_grupo_id, ejecutor, grupo_id,
// facultad_id, vinculacion). Las claves del body van SIN sufijo "_id"
// (persona, rol_grupo, grupo, facultad, vinculacion) porque el ViewSet las
// lee así directamente de request.data.
export const assignResearcher = createAsyncThunk(
  "users/assignResearcher",
  async (assignmentData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "institucional/persona-grupo/",
        assignmentData,
      );
      dispatch(fetchGroupUsers());
      return response.data;
    } catch (error) {
      // PersonaXGrupoValidator lanza ValidationError con distintas formas
      // (string envuelto en lista, o dict {campo: [mensajes]}) según el caso
      // -> cubrimos todas para no perder el detalle real del error.
      const data = error.response?.data;
      let mensaje = "Error al asignar el investigador.";
      if (typeof data === "string") mensaje = data;
      else if (Array.isArray(data)) mensaje = data.join(" ");
      else if (data && typeof data === "object") {
        mensaje = data.error || Object.values(data).flat().join(" ") || mensaje;
      }
      return rejectWithValue(mensaje);
    }
  },
);

/**
 * Thunk para obtener los roles de un usuario específico.
 *
 * apps/usuarios/views/rol_x_usuario_viewset.py -> @action(detail=False,
 * methods=['get'], url_path='ver-roles/(?P<usuario_id>[0-9]+)'). Devuelve un
 * array plano ya serializado (NO pasa por el paginador, a diferencia de
 * list()) con forma {id, usuario, rol, estado, usuario_nombre, rol_nombre}.
 */
export const fetchRolesForUser = createAsyncThunk(
  "users/fetchRolesForUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `usuarios/roles-usuario/ver-roles/${userId}/`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Error al cargar los roles del usuario.");
    }
  },
);

/**
 * Thunk para borrar (desactivar) un rol de un usuario.
 *
 * apps/usuarios/views/rol_x_usuario_viewset.py -> @action(detail=False,
 * methods=['post'], url_path='borrar-rol') -> RolXUsuarioService
 * .borrar_rol_de_usuario(usuario_id, rol_id, ejecutor). Identifica la
 * relación por el PAR (usuario_id, rol_id), no por el id de RolXUsuario
 * (no hay DELETE por pk en este ViewSet para esta operación).
 *
 * `arg` = { usuario_id, rol_id }
 */
export const deleteRoleFromUser = createAsyncThunk(
  "users/deleteRoleFromUser",
  async ({ usuario_id, rol_id }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post("usuarios/roles-usuario/borrar-rol/", {
        usuario_id,
        rol_id,
      });
      dispatch(fetchPlatformUsers());
      return { usuario_id, rol_id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al borrar el rol.",
      );
    }
  },
);

// Thunk para obtener todas las asignaciones de investigadores a proyectos
export const fetchInvestigatorAssignments = createAsyncThunk(
  "users/fetchInvestigatorAssignments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("investigacion-formal/investigadores/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        "Error al cargar las asignaciones de investigadores.",
      );
    }
  },
);

/**
 * Thunk para activar o desactivar un usuario.
 * apps/usuarios/views/usuario_viewset.py expone dos acciones separadas
 * (POST usuarios/{id}/activar/ y POST usuarios/{id}/desactivar/), ambas
 * restringidas a EsSoporte. `arg` = { userId, activar: boolean }.
 */
export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async ({ userId, activar }, { rejectWithValue }) => {
    try {
      const accion = activar ? "activar" : "desactivar";
      const response = await axiosInstance.post(
        `usuarios/${userId}/${accion}/`,
      );
      return { userId, activar, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          "Error al cambiar el estado del usuario.",
      );
    }
  },
);

/**
 * Thunk para desvincular (soft-delete) una persona de su grupo/facultad.
 * apps/institucional/views/persona_x_grupo_viewset.py ->
 * DELETE /institucional/persona-grupo/{id}/ (EsSoporte).
 * `arg` = personaXGrupoId (id de la fila de PersonaXGrupo, no de la persona).
 */
export const borrarPersonaDeGrupo = createAsyncThunk(
  "users/borrarPersonaDeGrupo",
  async (personaXGrupoId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(
        `institucional/persona-grupo/${personaXGrupoId}/`,
      );
      return { personaXGrupoId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al borrar del grupo.",
      );
    }
  },
);

/**
 * Thunk para reactivar una vinculación previamente desvinculada.
 * apps/institucional/views/persona_x_grupo_viewset.py ->
 * POST /institucional/persona-grupo/{id}/reactivar/ (EsSoporte).
 */
export const reactivarPersonaDeGrupo = createAsyncThunk(
  "users/reactivarPersonaDeGrupo",
  async (personaXGrupoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `institucional/persona-grupo/${personaXGrupoId}/reactivar/`,
      );
      return { personaXGrupoId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al reactivar.",
      );
    }
  },
);

/*
  Thunk para obtener el historial completo (activo e inactivo) de
  vinculaciones a grupo/facultad de una persona.
  apps/institucional/views/persona_x_grupo_viewset.py ->
  GET /institucional/persona-grupo/persona/{persona_id}/ (historial_persona)
  -> PersonaXGrupoSelector.historial_persona(persona_id), que NO filtra por
  estado (a diferencia de list(), que solo trae estado=True). Es la única
  vía para encontrar el id de una vinculación desvinculada y así poder
  llamar a reactivarPersonaDeGrupo.
*/
export const fetchHistorialPersona = createAsyncThunk(
  "users/fetchHistorialPersona",
  async (personaId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `institucional/persona-grupo/persona/${personaId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Error al cargar el historial de la persona.");
    }
  },
);


const usersSlice = createSlice({
  name: "users",
  initialState: {
    platformUsers: [],
    investigatorAssignments: [],
    groupUsers: [],
    userRoles: [],
    historialPersona: [],
    platformUsersTotal: 0,
    groupUsersTotal: 0,
    loading: false,
    historialPersonaLoading: false,
    rowLoading: {},
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
        state.platformUsers = action.payload.results ?? [];
        state.platformUsersTotal = action.payload.count ?? 0;
      })
      .addCase(fetchPlatformUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Role to User
      .addCase(addRoleToUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(addRoleToUser.fulfilled, (state) => {
        state.loading = false;
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
      })
      .addCase(assignResearcher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Roles for User
      .addCase(fetchRolesForUser.pending, (state) => {
        state.loading = true;
        state.userRoles = [];
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
        state.userRoles = [];
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
        state.groupUsers = action.payload.results ?? [];
        state.groupUsersTotal = action.payload.count ?? 0;
      })
      .addCase(fetchGroupUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle User Status
      .addCase(toggleUserStatus.pending, (state, action) => {
        state.rowLoading[action.meta.arg.userId] = true;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { userId, activar } = action.payload;
        state.rowLoading[userId] = false;
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.rowLoading[action.meta.arg.userId] = false;
        state.error = action.payload;
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
      })
      // Borrar / Reactivar persona de grupo
      .addCase(borrarPersonaDeGrupo.pending, (state, action) => {
        state.rowLoading[action.meta.arg] = true;
      })
      .addCase(borrarPersonaDeGrupo.fulfilled, (state, action) => {
        state.rowLoading[action.payload.personaXGrupoId] = false;
      })
      .addCase(borrarPersonaDeGrupo.rejected, (state, action) => {
        state.rowLoading[action.meta.arg] = false;
        state.error = action.payload;
      })
      .addCase(reactivarPersonaDeGrupo.pending, (state, action) => {
        state.rowLoading[action.meta.arg] = true;
      })
      .addCase(reactivarPersonaDeGrupo.fulfilled, (state, action) => {
        state.rowLoading[action.payload.personaXGrupoId] = false;
      })
      .addCase(reactivarPersonaDeGrupo.rejected, (state, action) => {
        state.rowLoading[action.meta.arg] = false;
        state.error = action.payload;
      })
      .addCase(fetchHistorialPersona.pending, (state) => {
        state.historialPersonaLoading = true;
      })
      .addCase(fetchHistorialPersona.fulfilled, (state, action) => {
        state.historialPersonaLoading = false;
        state.historialPersona = action.payload;
      })
      .addCase(fetchHistorialPersona.rejected, (state, action) => {
        state.historialPersonaLoading = false;
        state.error = action.payload;
      });
  },
});

export default usersSlice.reducer;
