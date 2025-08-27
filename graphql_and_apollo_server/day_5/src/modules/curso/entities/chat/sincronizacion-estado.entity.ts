export type SincronizacionEstado = {
    id: string;
    salaId: string;
    usuarioId: string;
    ultimaConexion: Date;
    estadoConexion: EstadoConexion;
    mensajesSincronizados: string[]; // IDs de mensajes ya sincronizados
    eventosPendientes: EventoPendiente[];
};

export type EventoPendiente = {
    id: string;
    datos: any;
    tipo: TipoEvento;
    fechaEvento: Date;
    procesado: boolean;
};

export enum TipoEvento {
    MENSAJE_VOZ = 'MENSAJE_VOZ',
    MENSAJE_NUEVO = 'MENSAJE_NUEVO',
    USUARIO_UNIDO = 'USUARIO_UNIDO',
    MENSAJE_EDITADO = 'MENSAJE_EDITADO',
    USUARIO_ABANDONO = 'USUARIO_ABANDONO',
    ESTADO_PRESENCIA = 'ESTADO_PRESENCIA',
    MENSAJE_ELIMINADO = 'MENSAJE_ELIMINADO',
}

export enum EstadoConexion {
    CONECTADO = 'CONECTADO',
    DESCONECTADO = 'DESCONECTADO',
    SINCRONIZANDO = 'SINCRONIZANDO',
    ERROR_CONEXION = 'ERROR_CONEXION'
}
