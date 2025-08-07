import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@modules/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });
    await app.listen(3000);

    console.log('Nest app listening on port 3000');
}

bootstrap();
