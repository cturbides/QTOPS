import { DataSource } from 'typeorm';
import { Etiqueta } from '../entities/etiqueta.entity';

export class EtiquetaSeed {
    public async run(dataSource: DataSource): Promise<void> {
        const etiquetaRepo = dataSource.getRepository(Etiqueta);

        const etiquetasBase = [
            { nombre: 'Programación' },
            { nombre: 'Bases de Datos' },
            { nombre: 'Desarrollo Web' },
            { nombre: 'Inteligencia Artificial' },
            { nombre: 'DevOps' }
        ];

        for (const etiquetaData of etiquetasBase) {
            const existe = await etiquetaRepo.findOne({ where: { nombre: etiquetaData.nombre } });
            if (!existe) {
                await etiquetaRepo.save(etiquetaData);
            }
        }

        console.log(`Seed de etiquetas completo`);
    }
}