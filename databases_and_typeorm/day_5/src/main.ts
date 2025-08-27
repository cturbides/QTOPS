// Task: Implementa pruebas de performance que verifiquen
//  que las consultas de búsqueda de cursos no excedan
//  500ms con 1000 registros en base de datos

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ELearningServiceRegistry } from './modules/service-discovery/services/e-learning-registry.service';
import { EducationalService } from './modules/service-discovery/interfaces/service-discovery.interfaces';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());

    const port = Number(process.env.SERVICE_PORT || 3000);
    await app.listen(port);

    console.log(`Nest app listening on port ${port}`);

    // Auto-register service with Consul
    try {
        const registry = app.get(ELearningServiceRegistry);
        const self: EducationalService = {
            tipo: process.env.SERVICE_NAME || 'course-service',
            host: process.env.SERVICE_HOST || 'localhost',
            port,
            version: process.env.SERVICE_VERSION || '1.0.0',
            dominio: process.env.SERVICE_DOMAIN || 'e-learning',
            capacidades: ['http', 'nestjs'],
            capacidadMaxima: 1000,
            rateLimitPerMinute: Number(process.env.SERVICE_RATE_LIMIT_PER_MINUTE || 600)
        };
        await registry.registrarServicioEducativo(self);
        console.log(`Service ${self.tipo} registered with Consul successfully`);
    } catch (error: any) {
        console.warn('Failed to register service with Consul:', error.message);
    }
}

bootstrap();
