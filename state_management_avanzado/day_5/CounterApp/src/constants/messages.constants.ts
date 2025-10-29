export const ERROR_MESSAGES = {
  USERS: {
    LOAD_ERROR: 'Error al cargar usuarios',
    NOT_FOUND: 'Usuario no encontrado',
  },
  STORAGE: {
    SAVE_FAILED: 'Error al guardar datos',
    LOAD_FAILED: 'Error al cargar datos',
    DELETE_FAILED: 'Error al eliminar datos',
    CLEAR_FAILED: 'Error al limpiar storage',
  },
  NETWORK: {
    NO_CONNECTION: 'Sin conexión a internet',
    TIMEOUT: 'Tiempo de espera agotado',
    UNKNOWN: 'Error desconocido',
  },
} as const;

export const SUCCESS_MESSAGES = {
  CACHE_CLEARED: 'Cache limpiado correctamente',
  DATA_SAVED: 'Datos guardados correctamente',
  DATA_DELETED: 'Datos eliminados correctamente',
} as const;

export const LOADING_MESSAGES = {
  LOADING_USERS: 'Cargando usuarios...',
  LOADING_DETAILS: 'Cargando detalles...',
  SAVING: 'Guardando...',
  DELETING: 'Eliminando...',
} as const;
