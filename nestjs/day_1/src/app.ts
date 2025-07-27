// Task: Extiende el módulo de usuarios agregando un ProfileService
//  que maneje la actualización de perfiles, manteniendo la separación
//  de responsabilidades y utilizando dependency injection apropiadamente

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.listen(3000);
}

bootstrap();
