import 'dotenv/config'; 
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());

    const port = Number(process.env.CURSO_COMPLETO_PORT || 3002);

    await app.listen(port);
    console.log(`Curso Completo microservice listening on port ${port}`);
}

bootstrap();