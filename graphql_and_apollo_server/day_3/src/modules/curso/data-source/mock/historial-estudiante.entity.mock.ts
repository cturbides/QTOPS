import { mockCursos } from "./curso.entity.mock";
import { mockUsuarios } from "./usuario.entity.mock";
import { HistorialEstudiante } from "@modules/curso/entities/historial-estudiante.entity";

export const mockHistorialEstudiante: HistorialEstudiante[] = [
    {
        userId: mockUsuarios[2].id,
        cursoId: mockCursos[0].id,
        fechaInicio: new Date('2025-01-01'),
        fechaCompletado: new Date('2025-02-15'),
        calificacion: 4.5,
        tiempoTotal: 240
    },
    {
        userId: mockUsuarios[3].id,
        cursoId: mockCursos[1].id,
        fechaInicio: new Date('2025-03-01'),
        calificacion: 4.8,
        tiempoTotal: 180
    },
    {
        userId: mockUsuarios[4].id,
        cursoId: mockCursos[0].id,
        fechaInicio: new Date('2025-02-01'),
        calificacion: 4.2,
        tiempoTotal: 200
    }
];