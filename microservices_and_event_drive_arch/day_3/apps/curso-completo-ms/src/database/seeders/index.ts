import { DataSource } from 'typeorm';
import { AppDataSource } from '@curso-completo/database/config/database'; 
import { CursoCompletoSeeder } from "@curso-completo/database/seeders/curso-completo/index";

(async () => {
    try {
        console.log('Conectando a la base de datos...');
        await AppDataSource.initialize();
        console.log('Conexión exitosa.');

        const dataSource: DataSource = AppDataSource;

        const cursoCompletoSeeder: CursoCompletoSeeder = new CursoCompletoSeeder();
        await cursoCompletoSeeder.run(dataSource);

        await AppDataSource.destroy();
        console.log('Conexión cerrada.');
    } catch (error) {
        console.error('Error al ejecutar los seeders:', error);
        process.exit(1);
    }
})();