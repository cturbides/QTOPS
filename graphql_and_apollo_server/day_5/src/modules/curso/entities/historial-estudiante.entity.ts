export type HistorialEstudiante = {
    userId: string;
    cursoId: string;
    fechaInicio: Date;
    tiempoTotal: number;
    calificacion?: number;
    fechaCompletado?: Date;
}