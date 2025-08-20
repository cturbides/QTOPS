// Task: Implementa un sistema de análisis de performance
//  que identifique automáticamente queries N+1 y
//  sugiera optimizaciones de eager loading

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
