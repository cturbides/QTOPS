// Task: Implementa un DataLoader que maneje
//  consultas agregadas complejas como estadísticas
//  de cursos con métricas de engagement calculadas
//  en tiempo real

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true
  });

  // Habilitar CORS para GraphQL subscriptions
  app.enableCors({
    origin: true,
    credentials: true
  });

  const port = process.env.PORT ?? 3000;

  console.log(`🚀 Servidor GraphQL iniciado en puerto ${port}`);
  console.log(`📡 GraphQL Playground: http://localhost:${port}/graphql`);
  console.log(`🔌 WebSocket Subscriptions: ws://localhost:${port}/graphql`);

  await app.listen(port);
}
bootstrap();
