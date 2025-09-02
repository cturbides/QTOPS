import { DataSource } from 'typeorm';
import { CursoCompleto } from '../../../modules/curso-completo/entities/curso-completo.entity';
import { LeccionCompleta } from '../../../modules/curso-completo/entities/leccion-completa.entity';

export class LeccionCompletaSeed {
    public async run(dataSource: DataSource): Promise<void> {
        const leccionRepo = dataSource.getRepository(LeccionCompleta);
        const cursoRepo = dataSource.getRepository(CursoCompleto);

        const curso: CursoCompleto | null = await cursoRepo.findOne({ where: { titulo: 'Curso de Programación Básica' } });

        if (!curso) {
            console.error('No se encontró un curso para asociar las lecciones.');
            return;
        }

        const leccionesBase = [
            {
                titulo: 'Introducción al Curso',
                contenido: 'Contenido introductorio del curso.',
                curso: curso
            },
            {
                titulo: 'Conceptos Básicos',
                contenido: 'Contenido sobre los conceptos básicos.',
                curso: curso
            },
            {
                titulo: 'Lección Avanzada',
                contenido: 'Contenido avanzado del curso.',
                curso: curso
            }
        ];

        for (const leccionData of leccionesBase) {
            const existe = await leccionRepo.findOne({ where: { titulo: leccionData.titulo, curso: { id: curso.id } } });

            if (!existe) {
                await leccionRepo.save(leccionData);
            }
        }

        console.log(`Seed de leccion completa finalizado!`);
    }
}