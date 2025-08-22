export type Curso = {
    id: string;
    titulo: string;
    ratings: number[];       // para nota promedio
    descripcion: string;
    instructorId: string;
    etiquetas?: string[];
    estudianteIds: string[]; // para estadísticas
};
