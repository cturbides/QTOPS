import { Injectable } from '@nestjs/common';
import { CursoService } from './curso.service';
import { dataSource } from '@modules/curso/data-source/index';
import { EstadisticasCurso } from '@modules/curso/graphql/types/estadisticas-curso.model';

@Injectable()
export class EstadisticasService {
    constructor(private readonly cursoService: CursoService) { }

    async calcularParaCurso(cursoId: string): Promise<EstadisticasCurso> {
        const curso = await this.cursoService.obtenerRecord(cursoId);

        const totalEstudiantes = curso.estudianteIds.length;
        const totalLecciones = dataSource.lecciones.filter(l => l.cursoId === cursoId).length;

        let calificacionPromedio = 0;

        if (curso.ratings.length > 0) {
            const sum = curso.ratings.reduce((a, b) => a + b, 0);
            calificacionPromedio = sum / curso.ratings.length;
        }

        return {
            totalLecciones,
            totalEstudiantes,
            calificacionPromedio
        };
    }
}
