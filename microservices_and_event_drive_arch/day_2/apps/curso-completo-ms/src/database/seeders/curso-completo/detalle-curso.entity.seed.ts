import { DataSource } from 'typeorm';
import { DetalleCurso } from '../../../modules/curso-completo/entities/detalle-curso.entity';
import { CursoCompleto } from '../../../modules/curso-completo/entities/curso-completo.entity';

export class DetalleCursoSeed {
    public async run(dataSource: DataSource): Promise<void> {
        const detalleRepo = dataSource.getRepository(DetalleCurso);
        const cursoRepo = dataSource.getRepository(CursoCompleto);

        const curso = await cursoRepo.findOne({ where: { titulo: 'Curso de Bases de Datos' } });

        if (!curso) {
            console.error('No se encontró un curso para asociar el detalle.');
            return;
        }

        const detalleBase = {
            objetivos: 'Aprender los fundamentos de bases de datos.',
            requisitos: 'Conocimientos básicos de SQL.',
            publicoObjetivo: 'Estudiantes y profesionales interesados en bases de datos.',
            curso: curso
        };

        const existe = await detalleRepo.findOne({ where: { curso: { id: curso.id } } });
        if (!existe) {
            await detalleRepo.save(detalleBase);
        }

        console.log(`Seed de detalle curso finalizado!`);
    }
}