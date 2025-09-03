import { DataSource } from 'typeorm';
import { EtiquetaSeed } from './etiqueta.entity.seed';
import { EvaluacionSeed } from './evaluacion.entity.seed';
import { InstructorSeed } from './instructor.entity.seed';
import { DetalleCursoSeed } from './detalle-curso.entity.seed';
import { CursoCompletoSeed } from './curso-completo.entity.seed';
import { LeccionCompletaSeed } from './leccion-completa.entity.seed';

export class CursoCompletoSeeder {
    async run(dataSource: DataSource): Promise<void> {
        console.log('Iniciando seeders');

        const instructorSeed = new InstructorSeed();
        await instructorSeed.run(dataSource);

        const cursoCompletoSeed = new CursoCompletoSeed();
        await cursoCompletoSeed.run(dataSource);

        const detalleCursoSeed = new DetalleCursoSeed();
        await detalleCursoSeed.run(dataSource);

        const leccionCompletaSeed = new LeccionCompletaSeed();
        await leccionCompletaSeed.run(dataSource);

        const etiquetaSeed = new EtiquetaSeed();
        await etiquetaSeed.run(dataSource);

        const evaluacionSeed = new EvaluacionSeed();
        await evaluacionSeed.run(dataSource);

        console.log('Seeders completados.');
    }
}