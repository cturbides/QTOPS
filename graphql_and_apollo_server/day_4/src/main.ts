// Task: Implementa un sistema de audit logging que
//  registre todas las operaciones GraphQL sensibles
//  con detalles de usuario, IP y resultado para
//  compliance y monitoreo de seguridad

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
