// Task: Extiende el sistema agregando un
//  patrón Circuit Breaker que prevenga cascading
//  failures cuando un servicio dependiente falla
//  repetidamente

import 'dotenv/config'; 
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from '@modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ELearningServiceRegistry } from './modules/service-discovery/services/e-learning-registry.service';
import { registerServiceWithConsul } from './modules/service-discovery/utils/service-registration.util';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());

    const port = Number(process.env.SERVICE_PORT || 3000);

    // Auto-register service with Consul before listening
    const registry = app.get(ELearningServiceRegistry);
    await registerServiceWithConsul(registry, port);

    await app.listen(port);
    console.log(`Nest app listening on port ${port}`);
}

bootstrap();
