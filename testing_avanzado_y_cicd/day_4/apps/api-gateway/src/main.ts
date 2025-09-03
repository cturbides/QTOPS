import 'dotenv/config';
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { registerServiceWithConsul } from '@shared-modules/service-discovery/utils/service-registration.util';
import { ELearningServiceRegistry } from '@shared-modules/service-discovery/services/e-learning-registry.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());

    const port = Number(process.env.API_GATEWAY_PORT || 3001);

    const registry = app.get(ELearningServiceRegistry);
    registerServiceWithConsul(registry, port);

    await app.listen(port);
    console.log(`API Gateway listening on port ${port}`);
}

bootstrap();