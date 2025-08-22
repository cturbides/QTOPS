import { Injectable } from '@nestjs/common';
import { dataSource } from '@modules/curso/data-source';
import { IObtenerProgresoDto } from '@modules/curso/dto/obtener-progreso.dto';
import { ProgresoEstudiante } from '@modules/curso/entities/progreso-estudiante.entity';

@Injectable()
export class ProgresoService {
    private returnEmptyProgreso(estudianteId: string, cursoId: string): ProgresoEstudiante {
        return {
            cursoId: cursoId,
            tiempoInvertido: 0,
            leccionesVistas: [],
            porcentajeCompletado: 0,
            ultimaActividad: undefined,
            estudianteId: estudianteId,
        }
    }

    async obtenerDetallado(
        dtos: IObtenerProgresoDto[],
    ): Promise<ProgresoEstudiante[]> {
        console.log(`[ProgresoService] Obteniendo progreso para ${dtos.length} estudiantes`);

        return dtos.map(dto => {
            const progreso = dataSource.progresoEstudiante.find(p =>
                p.estudianteId === dto.estudianteId && p.cursoId === dto.cursoId
            );

            return progreso || this.returnEmptyProgreso(dto.estudianteId, dto.cursoId);
        });
    }

    async obtenerPorEstudiante(estudianteId: string): Promise<ProgresoEstudiante[]> {
        return dataSource.progresoEstudiante.filter(p => p.estudianteId === estudianteId);
    }

    async obtenerPorCurso(cursoId: string): Promise<ProgresoEstudiante[]> {
        return dataSource.progresoEstudiante.filter(p => p.cursoId === cursoId);
    }
}
