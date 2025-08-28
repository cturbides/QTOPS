import 'dotenv/config';
import 'reflect-metadata';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { registerServiceWithConsul } from '@shared-modules/service-discovery/utils/service-registration.util';
import { ELearningServiceRegistry } from '@shared-modules/service-discovery/services/e-learning-registry.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());

    const port = Number(process.env.CURSO_COMPLETO_PORT || 3002);

    const registry = app.get(ELearningServiceRegistry);
    registerServiceWithConsul(registry, port);

    await app.listen(port);
    console.log(`Curso Completo microservice listening on port ${port}`);
}

bootstrap();