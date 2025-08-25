// Task: Implementa un DataLoader que maneje
//  consultas agregadas complejas como estadísticas
//  de cursos con métricas de engagement calculadas
//  en tiempo real

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? 3000;

  console.log(`Listening on port '${port}'.`);

  await app.listen(port);
}
bootstrap();
