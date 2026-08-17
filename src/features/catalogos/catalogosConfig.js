/**
 * Configuración declarativa de los catálogos administrables por EsSoporte.
 *
 * Cada entrada define:
 *  - key: identificador interno (también la clave del estado en catalogosSlice)
 *  - titulo / tituloSingular: textos para la UI
 *  - endpoint: ruta relativa bajo axiosInstance (sin barra inicial, con barra final)
 *  - permiteEliminar: si el ViewSet real implementa destroy(). Los 4 catálogos
 *    de este primer grupo NO lo implementan (revisado en *_viewset.py), así
 *    que la UI no ofrece borrar — mostrarlo sería prometer algo que el
 *    backend respondería con 405 Method Not Allowed.
 *  - campos: lista ordenada de campos, usada tanto para las columnas de la
 *    tabla como para el formulario de alta/edición.
 *
 * Grupo 1/4. Los próximos 10 catálogos (tipos-documento, roles-grupo,
 * roles-investigador, tipos-producto, tipos-rubro, puntos-control,
 * facultad-x-grupo, producto-x-grupo, productos-minciencias...) se agregan
 * aquí mismo siguiendo este patrón exacto.
 */
export const CATALOGOS_CONFIG = {
  rol_plataforma: {
    key: 'rol_plataforma',
    titulo: 'Roles de Plataforma',
    tituloSingular: 'Rol de Plataforma',
    // apps/usuarios/urls.py -> router.register(r'roles', RolPlataformaViewSet)
    endpoint: 'usuarios/roles/',
    permiteEliminar: false,
    campos: [
      { name: 'nombre_rol', label: 'Nombre del Rol', type: 'text', required: true, maxLength: 50 },
      { name: 'descripcion', label: 'Descripción', type: 'text', required: true, maxLength: 180 },
    ],
  },
  grado_estudios: {
    key: 'grado_estudios',
    titulo: 'Grados de Estudio',
    tituloSingular: 'Grado de Estudio',
    // apps/institucional/urls.py -> router.register(r'grados', GradoEstudiosViewSet)
    endpoint: 'institucional/grados/',
    permiteEliminar: false,
    campos: [
      { name: 'sigla_grado', label: 'Sigla', type: 'text', required: true, maxLength: 3 },
      { name: 'descripcion', label: 'Descripción', type: 'text', required: true, maxLength: 150 },
    ],
  },
  facultad_escuela: {
    key: 'facultad_escuela',
    titulo: 'Facultades / Escuelas',
    tituloSingular: 'Facultad',
    // apps/institucional/urls.py -> router.register(r'facultades', FacultadEscuelaViewSet)
    endpoint: 'institucional/facultades/',
    permiteEliminar: false,
    campos: [
      { name: 'nombre_facultad', label: 'Nombre de la Facultad', type: 'text', required: true, maxLength: 30 },
      { name: 'abreviatura', label: 'Abreviatura', type: 'text', required: true, maxLength: 5 },
    ],
  },
  grupo_investigacion: {
    key: 'grupo_investigacion',
    titulo: 'Grupos de Investigación',
    tituloSingular: 'Grupo de Investigación',
    // apps/institucional/urls.py -> router.register(r'grupos', GrupoInvestigacionViewSet)
    endpoint: 'institucional/grupos/',
    permiteEliminar: false,
    campos: [
      { name: 'nombre_grupo', label: 'Nombre del Grupo', type: 'text', required: true, maxLength: 50 },
      { name: 'sigla_grupo', label: 'Sigla', type: 'text', required: true, maxLength: 8 },
      { name: 'clasificacion_grupo', label: 'Clasificación', type: 'text', required: false, maxLength: 3 },
    ],
  },
  facultad_x_grupo: {
    key: 'facultad_x_grupo',
    titulo: 'Facultades por Grupo de Investigación',
    tituloSingular: 'Vínculo Facultad-Grupo',
    // apps/institucional/urls.py -> router.register(r'facultad-grupo', FacultadXGrupoViewSet)
    endpoint: 'institucional/facultad-grupo/',
    permiteEliminar: false, // docstring del ViewSet: "Sin destroy(): tabla estructural permanente"
    campos: [
      {
        name: 'grupo',
        label: 'Grupo de Investigación',
        type: 'select',
        required: true,
        optionsSource: 'grupos',       // state.metadata.grupos (ya se carga en fetchMetadata)
        optionLabel: 'nombre_grupo',
        optionValue: 'id',
        columnField: 'grupo_nombre',   // así lo expone FacultadXGrupoSerializer (source='grupo.sigla_grupo')
      },
      {
        name: 'facultad',
        label: 'Facultad',
        type: 'select',
        required: true,
        optionsSource: 'facultades',   // state.metadata.facultades
        optionLabel: 'nombre_facultad',
        optionValue: 'id',
        columnField: 'facultad_nombre', // FacultadXGrupoSerializer: source='facultad.abreviatura'
      },
    ],
  },
  rol_grupo: {
    key: 'rol_grupo',
    titulo: 'Roles de Grupo',
    tituloSingular: 'Rol de Grupo',
    // apps/institucional/urls.py -> router.register(r'roles-grupo', RolGrupoViewSet)
    endpoint: 'institucional/roles-grupo/',
    permiteEliminar: false,
    campos: [
      { name: 'cargo', label: 'Cargo', type: 'text', required: true, maxLength: 50 },
    ],
  },
  rol_investigador: {
    key: 'rol_investigador',
    titulo: 'Roles de Investigador',
    tituloSingular: 'Rol de Investigador',
    // apps/investigacion_formal/urls.py -> router.register(r'roles-investigador', RolInvestigadorViewSet)
    endpoint: 'investigacion-formal/roles-investigador/',
    permiteEliminar: false,
    // IMPORTANTE: create/update exigen [EsSoporte, TieneAmbitoFormal] — AMBOS,
    // no uno u otro (ver rol_investigador_viewset.py -> get_permissions()).
    // El token JWT solo trae el claim ambito='formal' si el login se hizo por
    // LoginFormalView. Un SOPORTE logueado por el flujo "formativa" verá un
    // 403 al crear/editar aquí aunque list/retrieve sí le funcionen.
    avisoPermiso:
      'Para crear o editar roles de investigador tu sesión debe haberse iniciado desde el módulo de Investigación Formal.',
    campos: [
      { name: 'nombre_rol_investigador', label: 'Nombre del Rol', type: 'text', required: true, maxLength: 50 },
      { name: 'descripcion', label: 'Descripción', type: 'text', required: true, maxLength: 150 },
    ],
  },
  tipo_documento: {
    key: 'tipo_documento',
    titulo: 'Tipos de Documento',
    tituloSingular: 'Tipo de Documento',
    // apps/common/urls.py -> router.register(r'tipos-documento', TipoDocumentoViewSet)
    endpoint: 'common/tipos-documento/',
    permiteEliminar: false,
    campos: [
      { name: 'nombre_documento', label: 'Nombre del Documento', type: 'text', required: true, maxLength: 40 },
      // El modelo NO restringe 'grupo' a choices fijas (es CharField libre),
      // pero el seed de INSERT_BEFORE_START solo usa 'convocatoria',
      // 'proyecto' y 'evaluacion' — se documenta como ayuda, no se fuerza.
      {
        name: 'grupo',
        label: 'Grupo (ej: convocatoria, proyecto, evaluacion)',
        type: 'text',
        required: true,
        maxLength: 30,
      },
    ],
  },
  tipo_calificacion: {
    key: 'tipo_calificacion',
    titulo: 'Tipos de Calificación',
    tituloSingular: 'Tipo de Calificación',
    // apps/investigacion_formal/urls.py -> router.register(r'tipos-calificacion', TipoCalificacionViewSet)
    endpoint: 'investigacion-formal/tipos-calificacion/',
    permiteEliminar: false,
    avisoPermiso:
      'Para crear o editar tipos de calificación tu sesión debe haberse iniciado desde el módulo de Investigación Formal.',
    campos: [
      { name: 'tipo_calificacion', label: 'Tipo de Calificación', type: 'text', required: true, maxLength: 30 },
      { name: 'descripcion', label: 'Descripción', type: 'text', required: true, maxLength: 150 },
      { name: 'evaluacion', label: '¿Es Evaluación?', type: 'checkbox' },
      {
        // OJO: el nombre real del campo en el modelo es 'orden_fase', pero
        // tipo_calificacion_viewset.py lee request.data.get("ordenFase")
        // (camelCase) al crear/editar — NO uses 'orden_fase' aquí o el
        // backend recibirá None silenciosamente. Ver TipoCalificacionSerializer
        // (declara 'ordenFase' como alias read_only de 'orden_fase') y el
        // create()/update() del ViewSet, que ignora ese alias y lee el
        // body crudo con la clave camelCase.
        name: 'ordenFase',
        label: 'Orden de la Fase',
        type: 'number',
        required: true,
      },
    ],
  },
  producto_minciencias: {
    key: 'producto_minciencias',
    titulo: 'Productos Minciencias',
    tituloSingular: 'Producto Minciencias',
    // apps/investigacion_formal/urls.py -> router.register(r'productos-minciencias', ProductoMincienciasViewSet)
    endpoint: 'investigacion-formal/productos-minciencias/',
    permiteEliminar: false,
    avisoPermiso:
      'Para crear o editar productos Minciencias tu sesión debe haberse iniciado desde el módulo de Investigación Formal.',
    campos: [
      { name: 'nombre_producto', label: 'Nombre del Producto', type: 'text', required: true, maxLength: 200 },
      { name: 'nomenclatura', label: 'Nomenclatura', type: 'text', required: true, maxLength: 20 },
      { name: 'peso', label: 'Peso', type: 'number', required: true },
      { name: 'vigencia', label: 'Vigencia (años)', type: 'number', required: true },
    ],
  },
  grupo_minciencias: {
    key: 'grupo_minciencias',
    titulo: 'Grupos Minciencias',
    tituloSingular: 'Grupo Minciencias',
    // apps/investigacion_formal/urls.py -> router.register(r'grupos-minciencias', GrupoMincienciasViewSet)
    endpoint: 'investigacion-formal/grupos-minciencias/',
    permiteEliminar: false,
    avisoPermiso:
      'Para crear o editar grupos Minciencias tu sesión debe haberse iniciado desde el módulo de Investigación Formal.',
    campos: [
      { name: 'nombre_grupo_minciencias', label: 'Nombre del Grupo Minciencias', type: 'text', required: true, maxLength: 150 },
    ],
  },
  tipo_producto: {
    key: 'tipo_producto',
    titulo: 'Tipos de Producto',
    tituloSingular: 'Tipo de Producto',
    // apps/investigacion_formal/urls.py -> router.register(r'tipos-producto', TipoProductoViewSet)
    endpoint: 'investigacion-formal/tipos-producto/',
    permiteEliminar: false,
    avisoPermiso:
      'Para crear o editar tipos de producto tu sesión debe haberse iniciado desde el módulo de Investigación Formal.',
    campos: [
      { name: 'tipo_producto', label: 'Tipo de Producto', type: 'text', required: true, maxLength: 200 },
      { name: 'aplica', label: '¿Aplica?', type: 'checkbox' },
    ],
  },
  producto_x_grupo: {
    key: 'producto_x_grupo',
    titulo: 'Productos por Grupo',
    tituloSingular: 'Producto x Grupo',
    // apps/investigacion_formal/urls.py -> router.register(r'productos-grupo', ProductoXGrupoViewSet)
    endpoint: 'investigacion-formal/productos-grupo/',
    permiteEliminar: false, // no hay destroy() implementado pese a que get_permissions() lo contempla
    avisoPermiso:
      'Para crear o editar aquí tu sesión debe haberse iniciado desde el módulo de Investigación Formal. A diferencia de los demás catálogos, EsSoporte no es el único rol habilitado: también pueden escribir aquí los roles operativos definidos en ROLES_CREACION_OPERATIVA / ROLES_ESCRITURA_GESTION.',
    campos: [
      {
        name: 'producto_minciencias',
        label: 'Producto Minciencias',
        type: 'select',
        required: true,
        optionsSource: 'productosMinciencias',
        optionLabel: 'nombre_producto',
        optionValue: 'id',
        columnField: 'producto_nombre', // ProductoXGrupoSerializer: source='producto_minciencias.nombre_producto'
      },
      {
        name: 'grupo_minciencias',
        label: 'Grupo Minciencias',
        type: 'select',
        required: true,
        optionsSource: 'gruposMinciencias',
        optionLabel: 'nombre_grupo_minciencias',
        optionValue: 'id',
        columnField: 'grupo_nombre', // source='grupo_minciencias.nombre_grupo_minciencias'
      },
      {
        name: 'tipo_producto',
        label: 'Tipo de Producto',
        type: 'select',
        required: true,
        optionsSource: 'tiposProducto',
        optionLabel: 'tipo_producto',
        optionValue: 'id',
        columnField: 'tipo_producto_nombre', // source='tipo_producto.tipo_producto'
      },
    ],
  },
  tipo_rubro: {
    key: 'tipo_rubro',
    titulo: 'Tipos de Rubro',
    tituloSingular: 'Tipo de Rubro',
    // apps/investigacion_formal/urls.py -> router.register(r'tipos-rubro', TipoRubroViewSet)
    endpoint: 'investigacion-formal/tipos-rubro/',
    permiteEliminar: false,
    avisoPermiso:
      'Para crear o editar tipos de rubro tu sesión debe haberse iniciado desde el módulo de Investigación Formal.',
    campos: [
      { name: 'nombre_rubro', label: 'Nombre del Rubro', type: 'text', required: true, maxLength: 50 },
    ],
  },    
};