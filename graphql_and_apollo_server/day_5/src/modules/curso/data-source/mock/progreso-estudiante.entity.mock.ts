import { mockCursos } from "./curso.entity.mock";
import { mockUsuarios } from "./usuario.entity.mock";
import { ProgresoEstudiante } from "@modules/curso/entities/progreso-estudiante.entity";


export const mockProgresoEstudiante: ProgresoEstudiante[] = [
    {
        cursoId: mockCursos[0].id,
        estudianteId: mockUsuarios[2].id,
        porcentajeCompletado: 75,
        leccionesVistas: ['1', '2', '3'],
        tiempoInvertido: 240,
        ultimaActividad: new Date('2025-08-20')
    },
    {
        estudianteId: mockUsuarios[3].id,
        cursoId: mockCursos[1].id,
        porcentajeCompletado: 50,
        leccionesVistas: ['1', '2'],
        tiempoInvertido: 120,
        ultimaActividad: new Date('2025-08-21')
    },
    {
        tiempoInvertido: 360,
        cursoId: mockCursos[1].id,
        estudianteId: mockUsuarios[4].id,
        porcentajeCompletado: 100,
        leccionesVistas: ['1', '2', '3', '4'],
        ultimaActividad: new Date('2025-08-22')
    }
];