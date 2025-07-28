// Task: Implementa un Interceptor de caché que almacene respuestas
//  de endpoints GET durante 5 minutos, invalidando el caché cuando
//  se realizan operaciones de escritura (POST, PUT, DELETE).

// Ojo: Agregado en @common/interceptors/cache.interceptor.ts
//  Aplicado en @orders/controllers/orders.controller.ts

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.listen(3000);
}

bootstrap();
