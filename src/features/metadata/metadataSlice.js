import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunk para cargar todos los datos maestros necesarios para los formularios
export const fetchMetadata = createAsyncThunk(
  'metadata/fetchMetadata',
  async (_, { rejectWithValue }) => {
    try {
      const [grados, roles, facultades, grupos, rolesGrupo, usuarios, tiposDocumento, productosMinciencias, tiposProducto, tiposRubro, puntosControl, personasXGrupo, rolesInvestigador] = await Promise.all([
        axiosInstance.get('grados-estudios/'),
        axiosInstance.get('roles-plataforma/'),
        axiosInstance.get('facultades-escuela/'),
        axiosInstance.get('grupos-investigacion/'),
        axiosInstance.get('roles-grupo/'), 
        axiosInstance.get('usuarios/'), 
        axiosInstance.get('tipos-documento/'),
        axiosInstance.get('productos-minciencias/'),
        axiosInstance.get('tipos-producto/'),
        axiosInstance.get('tipos-rubro/'),
        axiosInstance.get('puntos-control/'),
        axiosInstance.get('personas-x-grupo/'), // Para el modal de agregar investigador
        axiosInstance.get('roles-investigador/'),
      ]);
      return {
        grados: grados.data,
        roles: roles.data,
        facultades: facultades.data,
        grupos: grupos.data,
        rolesGrupo: rolesGrupo.data, 
        usuarios: usuarios.data,
        tiposDocumento: tiposDocumento.data,
        productosMinciencias: productosMinciencias.data,
        tiposProducto: tiposProducto.data,
        tiposRubro: tiposRubro.data,
        puntosControl: puntosControl.data,
        personasXGrupo: personasXGrupo.data,
        rolesInvestigador: rolesInvestigador.data,
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
    tiposDocumento: [], 
    productosMinciencias: [],
    tiposProducto: [],
    tiposRubro: [],
    puntosControl: [],
    personasXGrupo: [],
    rolesInvestigador: [],
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
        state.tiposDocumento = action.payload.tiposDocumento;
        state.productosMinciencias = action.payload.productosMinciencias;
        state.tiposProducto = action.payload.tiposProducto;
        state.tiposRubro = action.payload.tiposRubro;
        state.puntosControl = action.payload.puntosControl;
        state.personasXGrupo = action.payload.personasXGrupo;
        state.rolesInvestigador = action.payload.rolesInvestigador;
      })
      .addCase(fetchMetadata.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default metadataSlice.reducer;
