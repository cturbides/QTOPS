// Task: Implementa un DTO para búsqueda de productos que incluya
//  filtros opcionales (precio mínimo/máximo, categoría, tags)
//  con validación apropiada y transformación de parámetros de query.

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    await app.listen(3000);
}

bootstrap();
