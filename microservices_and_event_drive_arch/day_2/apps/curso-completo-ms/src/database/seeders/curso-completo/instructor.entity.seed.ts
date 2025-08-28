import { DataSource } from 'typeorm';
import { Instructor } from '../entities/instructor.entity';

export class InstructorSeed {
    public async run(dataSource: DataSource): Promise<void> {
        const instructorRepo = dataSource.getRepository(Instructor);

        const instructoresBase = [
            {
                nombre: 'Juan Pérez',
                email: 'juan.perez@plataforma.com'
            },
            {
                nombre: 'María López',
                email: 'maria.lopez@plataforma.com'
            },
            {
                nombre: 'Carlos García',
                email: 'carlos.garcia@plataforma.com'
            }
        ];

        for (const instructorData of instructoresBase) {
            const existe = await instructorRepo.findOne({ where: { email: instructorData.email } });
            if (!existe) {
                await instructorRepo.save(instructorData);
            }
        }

        console.log(`Seed de instructor completo`);
    }
}