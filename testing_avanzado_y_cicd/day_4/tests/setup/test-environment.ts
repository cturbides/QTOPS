import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { DataSource } from 'typeorm';
import * as redisStore from 'cache-manager-ioredis';

import { CursoCompletoService } from '../../apps/curso-completo-ms/src/modules/curso-completo/services/curso-completo.service';
import { CursoCompleto } from '../../apps/curso-completo-ms/src/modules/curso-completo/entities/curso-completo.entity';
import { Etiqueta } from '../../apps/curso-completo-ms/src/modules/curso-completo/entities/etiqueta.entity';
import { Instructor } from '../../apps/curso-completo-ms/src/modules/curso-completo/entities/instructor.entity';
import { Evaluacion } from '../../apps/curso-completo-ms/src/modules/curso-completo/entities/evaluacion.entity';
import { DetalleCurso } from '../../apps/curso-completo-ms/src/modules/curso-completo/entities/detalle-curso.entity';
import { LeccionCompleta } from '../../apps/curso-completo-ms/src/modules/curso-completo/entities/leccion-completa.entity';

export interface TestServices {
  cursoCompleto: CursoCompletoService;
  evaluacion: {
    repository: any;
  };
}

export class TestEnvironment {
  private postgresContainer: StartedPostgreSqlContainer;
  private redisContainer: StartedRedisContainer;
  private app: TestingModule;
  private dataSource: DataSource;

  static async create(services: string[] = ['postgres', 'redis']): Promise<TestEnvironment> {
    const env = new TestEnvironment();
    await env.initialize(services);
    return env;
  }

  private async initialize(services: string[]): Promise<void> {
    // Iniciar contenedores en paralelo
    const containerPromises: Promise<any>[] = [];

    if (services.includes('postgres')) {
      containerPromises.push(
        new PostgreSqlContainer('postgres:15-alpine')
          .withDatabase('test_cursos')
          .withUsername('test_user')
          .withPassword('test_pass')
          .withExposedPorts(5432)
          .start()
      );
    }

    if (services.includes('redis')) {
      containerPromises.push(
        new RedisContainer('redis:7-alpine')
          .withExposedPorts(6379)
          .start()
      );
    }

    const containers = await Promise.all(containerPromises);
    
    if (services.includes('postgres')) {
      this.postgresContainer = containers[0];
    }
    
    if (services.includes('redis')) {
      this.redisContainer = services.includes('postgres') ? containers[1] : containers[0];
    }

    // Configurar módulo de testing con contenedores reales
    const moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: this.postgresContainer.getHost(),
          port: this.postgresContainer.getPort(),
          username: this.postgresContainer.getUsername(),
          password: this.postgresContainer.getPassword(),
          database: this.postgresContainer.getDatabase(),
          entities: [CursoCompleto, Etiqueta, Instructor, Evaluacion, DetalleCurso, LeccionCompleta],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([CursoCompleto, Etiqueta, Instructor, Evaluacion]),
        CacheModule.register({
          store: this.redisContainer ? redisStore : 'memory',
          host: this.redisContainer?.getHost(),
          port: this.redisContainer?.getPort(),
          ttl: 1000,
          max: 100,
        }),
      ],
      providers: [CursoCompletoService],
    }).compile();

    this.app = moduleFixture;
    this.dataSource = this.app.get<DataSource>(DataSource);
  }

  getServices(): TestServices {
    return {
      cursoCompleto: this.app.get<CursoCompletoService>(CursoCompletoService),
      evaluacion: {
        repository: this.dataSource.getRepository(Evaluacion)
      }
    };
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  async cleanDatabase(): Promise<void> {
    try {
      // Limpiar tablas en orden correcto (respetando foreign keys)
      // Solo limpiar las tablas que sabemos que existen
      await this.dataSource.query('DELETE FROM evaluaciones');
      await this.dataSource.query('DELETE FROM curso_etiquetas');
      await this.dataSource.query('DELETE FROM cursos_completos');
      await this.dataSource.query('DELETE FROM etiquetas');
      await this.dataSource.query('DELETE FROM instructores');
    } catch (error) {
      // Ignorar errores de tablas que no existen en testing
      console.log('Warning: Error cleaning database tables (may be expected in testing):', error.message);
    }
  }

  async cleanup(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
    
    const cleanupPromises: Promise<any>[] = [];
    
    if (this.postgresContainer) {
      cleanupPromises.push(this.postgresContainer.stop());
    }
    
    if (this.redisContainer) {
      cleanupPromises.push(this.redisContainer.stop());
    }
    
    await Promise.all(cleanupPromises);
  }
}
