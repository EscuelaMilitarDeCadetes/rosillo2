import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// --------------------------------------------------------------------- //
// Todas las rutas de listado del backend (RolPlataformaViewSet,
// FacultadEscuelaViewSet, GrupoInvestigacionViewSet, RolGrupoViewSet,
// GradoEstudiosViewSet, UsuarioViewSet...) usan ViewSet.list() con
// pagination_class propio -> SIEMPRE devuelven
// { count, next, previous, results: [...] }, nunca un array plano.
// `extraerResultados` normaliza eso para que el resto del código pueda
// seguir usando arrays directamente, sea cual sea la forma de la respuesta.
// --------------------------------------------------------------------- //
const extraerResultados = (data) => (Array.isArray(data) ? data : data?.results ?? []);

// Los catálogos (grados, roles, facultades, grupos, roles-grupo) son
// pequeños pero pueden superar el page_size=20 por defecto (ver
// UsuariosPageNumberPagination / InstitucionalPageNumberPagination).
// Pedimos explícitamente una página grande para traerlos completos de una
// sola vez, ya que se usan como opciones de <Dropdown>, no como listados
// paginados.
const SIN_PAGINAR = { params: { page_size: 200 } };

// Thunk para cargar todos los datos maestros necesarios para los formularios
export const fetchMetadata = createAsyncThunk(
  'metadata/fetchMetadata',
  async (_, { rejectWithValue }) => {
    try {
      const [
        grados,
        roles,
        facultades,
        grupos,
        rolesGrupo,
        usuarios,
        personas,
        tiposDocumento,
        productosMinciencias,
        tiposProducto,
        tiposRubro,
        puntosControl,
        personasXGrupo,
        rolesInvestigador,        
        gruposMinciencias,
      ] = await Promise.all([
        // apps/institucional/urls.py -> router.register(r'grados', ...)
        axiosInstance.get('institucional/grados/', SIN_PAGINAR),
        // apps/usuarios/urls.py -> router.register(r'roles', RolPlataformaViewSet)
        axiosInstance.get('usuarios/roles/', SIN_PAGINAR),
        // apps/institucional/urls.py -> router.register(r'facultades', ...)
        axiosInstance.get('institucional/facultades/', SIN_PAGINAR),
        // apps/institucional/urls.py -> router.register(r'grupos', ...)
        axiosInstance.get('institucional/grupos/', SIN_PAGINAR),
        // apps/institucional/urls.py -> router.register(r'roles-grupo', RolGrupoViewSet)
        axiosInstance.get('institucional/roles-grupo/', SIN_PAGINAR),
        // apps/usuarios/urls.py -> router.register(r'usuarios', UsuarioViewSet)
        axiosInstance.get('usuarios/usuarios/', SIN_PAGINAR),
        // apps/institucional/urls.py -> router.register(r'personas', PersonaViewSet)
        axiosInstance.get('institucional/personas/', SIN_PAGINAR),
        // Verificado contra apps/common/urls.py y apps/investigacion_formal/urls.py
        // (montados en api/common/ y api/investigacion-formal/ respectivamente).
        axiosInstance.get('common/tipos-documento/', SIN_PAGINAR),
        axiosInstance.get('investigacion-formal/productos-minciencias/', SIN_PAGINAR),
        axiosInstance.get('investigacion-formal/tipos-producto/', SIN_PAGINAR),
        axiosInstance.get('investigacion-formal/tipos-rubro/', SIN_PAGINAR),
        axiosInstance.get('investigacion-formal/puntos-control/', SIN_PAGINAR),        
        // apps/institucional/urls.py -> router.register(r'persona-grupo', ...)
        axiosInstance.get('institucional/persona-grupo/', SIN_PAGINAR),
        axiosInstance.get('investigacion-formal/roles-investigador/', SIN_PAGINAR),
        // apps/investigacion_formal/urls.py -> router.register(r'grupos-minciencias', GrupoMincienciasViewSet)
        axiosInstance.get('investigacion-formal/grupos-minciencias/', SIN_PAGINAR),
      ]);

      return {
        grados: extraerResultados(grados.data),
        roles: extraerResultados(roles.data),
        facultades: extraerResultados(facultades.data),
        grupos: extraerResultados(grupos.data),
        rolesGrupo: extraerResultados(rolesGrupo.data),
        usuarios: extraerResultados(usuarios.data),
        personas: extraerResultados(personas.data),
        tiposDocumento: extraerResultados(tiposDocumento.data),
        productosMinciencias: extraerResultados(productosMinciencias.data),
        tiposProducto: extraerResultados(tiposProducto.data),
        tiposRubro: extraerResultados(tiposRubro.data),
        puntosControl: extraerResultados(puntosControl.data),
        personasXGrupo: extraerResultados(personasXGrupo.data),
        rolesInvestigador: extraerResultados(rolesInvestigador.data),
        gruposMinciencias: extraerResultados(gruposMinciencias.data),
      };
    } catch (error) {
      return rejectWithValue('Error al cargar los datos maestros.');
    }
  }
);

const metadataSlice = createSlice({
  name: 'metadata',
  initialState: {
    grados: [],
    roles: [],
    facultades: [],
    grupos: [],
    rolesGrupo: [],
    usuarios: [],
    personas: [],
    tiposDocumento: [],
    productosMinciencias: [],
    tiposProducto: [],
    tiposRubro: [],
    puntosControl: [],
    personasXGrupo: [],
    rolesInvestigador: [],
    gruposMinciencias: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetadata.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMetadata.fulfilled, (state, action) => {
        state.loading = false;
        state.grados = action.payload.grados;
        state.roles = action.payload.roles;
        state.facultades = action.payload.facultades;
        state.grupos = action.payload.grupos;
        state.rolesGrupo = action.payload.rolesGrupo;
        state.usuarios = action.payload.usuarios;
        state.personas = action.payload.personas;
        state.tiposDocumento = action.payload.tiposDocumento;
        state.productosMinciencias = action.payload.productosMinciencias;
        state.tiposProducto = action.payload.tiposProducto;
        state.tiposRubro = action.payload.tiposRubro;
        state.puntosControl = action.payload.puntosControl;
        state.personasXGrupo = action.payload.personasXGrupo;
        state.rolesInvestigador = action.payload.rolesInvestigador;
        state.gruposMinciencias = action.payload.gruposMinciencias;
      })
      .addCase(fetchMetadata.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default metadataSlice.reducer;