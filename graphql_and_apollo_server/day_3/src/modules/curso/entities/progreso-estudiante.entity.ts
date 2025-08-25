export type ProgresoEstudiante = {
    cursoId: string;
    estudianteId: string;
    ultimaActividad?: Date;
    tiempoInvertido?: number;
    leccionesVistas: string[];
    porcentajeCompletado: number;
}
