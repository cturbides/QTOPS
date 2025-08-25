export interface IConnectionInfo {
    socketId: string;
    usuarioId: string;
    cursoActual?: string;
    ultimaActividad: Date;
    suscripciones: Set<string>;
}