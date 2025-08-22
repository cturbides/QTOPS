// Task: Extiende el esquema agregando subscriptions para 
//  notificaciones en tiempo real cuando un usuario se
//  inscribe a un curso

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? 3000;

  console.log(`Listening on port '${port}'.`);

  await app.listen(port);
}
bootstrap();
