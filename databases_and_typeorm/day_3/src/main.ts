// Task: Crea una migración para agregar auditoría completa
//  (createdAt, updatedAt, deletedAt) a todas las tablas
//  existentes manteniendo compatibilidad hacia atrás.

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@modules/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());

    await app.listen(3000);

    console.log('Nest app listening on port 3000');
}

bootstrap();
