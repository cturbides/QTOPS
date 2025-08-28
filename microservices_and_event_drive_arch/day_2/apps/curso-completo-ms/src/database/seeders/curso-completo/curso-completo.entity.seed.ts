import { DataSource } from 'typeorm';
import { Instructor } from '../entities/instructor.entity';
import { CursoCompleto } from '../entities/curso-completo.entity';

export class CursoCompletoSeed {
    public async run(dataSource: DataSource): Promise<void> {
        const cursoRepo = dataSource.getRepository(CursoCompleto);
        const instructorRepo = dataSource.getRepository(Instructor);

        // Obtener un instructor existente para asociar al curso
        const instructor = await instructorRepo.findOne({ where: { email: 'juan.perez@plataforma.com' } });
        if (!instructor) {
            console.error('No se encontró un instructor para asociar al curso.');
            return;
        }

        const cursosBase = [
            {
                titulo: 'Curso de Programación Básica',
                descripcion: 'Aprende los fundamentos de la programación desde cero.',
                instructor: instructor
            },
            {
                titulo: 'Curso de Desarrollo Web',
                descripcion: 'Domina las tecnologías esenciales para crear sitios web.',
                instructor: instructor
            },
            {
                titulo: 'Curso de Bases de Datos',
                descripcion: 'Conoce cómo diseñar y gestionar bases de datos relacionales.',
                instructor: instructor
            }
        ];

        for (const cursoData of cursosBase) {
            const existe = await cursoRepo.findOne({ where: { titulo: cursoData.titulo } });
            if (!existe) {
                await cursoRepo.save(cursoData);
            }
        }
        
        console.log(`Seed de curso completo finalizado!`);
    }
}