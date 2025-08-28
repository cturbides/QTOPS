import { DataSource } from 'typeorm';
import { Evaluacion } from '../entities/evaluacion.entity';
import { CursoCompleto } from '../entities/curso-completo.entity';

export class EvaluacionSeed {
    public async run(dataSource: DataSource): Promise<void> {
        const evaluacionRepo = dataSource.getRepository(Evaluacion);
        const cursoRepo = dataSource.getRepository(CursoCompleto);

        const curso = await cursoRepo.findOne({ where: { titulo: 'Curso de Programación Básica' } });

        if (!curso) {
            console.error('No se encontró un curso para asociar las evaluaciones.');
            return;
        }

        const evaluacionesBase = [
            {
                puntuacion: 5,
                comentario: 'Excelente curso, muy recomendado.',
                curso: curso
            },
            {
                puntuacion: 4,
                comentario: 'Muy buen contenido, aunque podría mejorar en algunos aspectos.',
                curso: curso
            },
            {
                puntuacion: 3,
                comentario: 'El curso es aceptable, pero esperaba más profundidad.',
                curso: curso
            }
        ];

        for (const evaluacionData of evaluacionesBase) {
            const existe = await evaluacionRepo.findOne({ where: { puntuacion: evaluacionData.puntuacion, curso: { id: curso.id } } });
            if (!existe) {
                await evaluacionRepo.save(evaluacionData);
            }
        }

        console.log(`Seed de evaluacion finalizado!`);
    }
}