import { DataSource } from 'typeorm';
import { Etiqueta } from '@curso-completo/entities/etiqueta.entity';
import { Instructor } from '@curso-completo/entities/instructor.entity';
import { Evaluacion } from '@curso-completo/entities/evaluacion.entity';
import { DetalleCurso } from '@curso-completo/entities/detalle-curso.entity';
import { CursoCompleto } from '@curso-completo/entities/curso-completo.entity';
import { LeccionCompleta } from '@curso-completo/entities/leccion-completa.entity';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export class TestDatabaseConfig {
    private static dataSource: DataSource;
    private static container: StartedPostgreSqlContainer;

    static async startDatabase(): Promise<{ dataSource: DataSource; container: StartedPostgreSqlContainer }> {
        this.container = await new PostgreSqlContainer('postgres:15')
            .withDatabase('test_performance')
            .withUsername('test_user')
            .withPassword('test_password')
            .start();

        const dataSource = new DataSource({
            type: 'postgres',
            host: this.container.getHost(),
            port: this.container.getPort(),
            username: this.container.getUsername(),
            password: this.container.getPassword(),
            database: this.container.getDatabase(),
            entities: [
                Etiqueta,
                Instructor,
                Evaluacion,
                DetalleCurso,
                CursoCompleto,
                LeccionCompleta
            ],
            synchronize: true,
            dropSchema: true,
        });

        await dataSource.initialize();

        this.dataSource = dataSource;

        return { dataSource: this.dataSource, container: this.container };
    }

    static async stopDatabase(): Promise<void> {
        if (this.dataSource) {
            await this.dataSource.destroy();
        }

        if (this.container) {
            await this.container.stop();
        }
    }
}
