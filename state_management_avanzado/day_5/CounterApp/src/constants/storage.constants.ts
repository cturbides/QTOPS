export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const ALERT_MESSAGES = {
  CLEAR_CACHE: {
    TITLE: 'Limpiar Cache',
    MESSAGE: '¿Estás seguro de que deseas limpiar el cache de usuarios?',
    SUCCESS: 'Cache limpiado correctamente',
    ERROR: 'No se pudo limpiar el cache',
  },
  CLEAR_ALL: {
    TITLE: 'Limpiar Todo',
    MESSAGE: '¿Estás seguro de que deseas eliminar TODOS los datos almacenados? Esta acción no se puede deshacer.',
    SUCCESS: 'Todos los datos han sido eliminados',
    ERROR: 'No se pudieron eliminar los datos',
  },
  BUTTON_LABELS: {
    CANCEL: 'Cancelar',
    CLEAR: 'Limpiar',
    DELETE_ALL: 'Eliminar Todo',
  },
} as const;

export const STORAGE_LABELS = {
  SECTION_TITLES: {
    STORAGE_INFO: '📊 Información de Storage',
    DATA_MANAGEMENT: '🧹 Gestión de Datos',
    INFO: 'ℹ️ Información',
  },
  INFO_LABELS: {
    TOTAL_KEYS: 'Total de claves:',
    USERS_IN_CACHE: 'Usuarios en cache:',
    CACHE_STATUS: 'Estado del cache:',
    LAST_UPDATE: 'Última actualización:',
    CACHE_AGE: 'Antigüedad del cache:',
  },
  BUTTON_LABELS: {
    CLEAR_CACHE: '🗑️ Limpiar Cache de Usuarios',
    CLEAR_ALL: '⚠️ Eliminar Todos los Datos',
    REFRESH: '🔄 Actualizar Información',
    CLEARING: 'Limpiando...',
  },
  STATUS: {
    VALID: '✅ Válido',
    EXPIRED: '❌ Expirado',
    NOT_AVAILABLE: 'No disponible',
    NA: 'N/A',
  },
  INFO_TEXT: [
    '• El cache de usuarios expira después de 5 minutos',
    '• Los datos persisten entre sesiones de la app',
    '• Limpiar el cache forzará una nueva carga desde el servidor',
  ].join('\n'),
} as const;

export const CACHE_INDICATORS = {
  UPDATING: '🔄 Actualizando...',
  CACHED: '💾 Datos en cache',
  SERVER: '🌐 Datos del servidor',
} as const;
