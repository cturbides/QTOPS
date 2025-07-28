// Task: Implementa un sistema de retry automático
//  para errores transitorios (timeouts, errores de red)
//  que reintente la operación hasta 3 veces con backoff
//  exponencial antes de devolver el error al cliente.

// Ojo: Agregado en @orders

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.listen(3000);
}

bootstrap();
