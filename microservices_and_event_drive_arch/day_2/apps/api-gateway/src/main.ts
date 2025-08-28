import 'dotenv/config'; 
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConsulClient } from '@shared/modules/service-discovery/consul.client';
import { ConsulRegistration } from '@shared/modules/service-discovery/consul.registration';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());

    const port = Number(process.env.API_GATEWAY_PORT || 3000);

    // Register with Consul
    const consulClient = new ConsulClient();
    const consulRegistration = new ConsulRegistration(consulClient, {
        serviceName: process.env.API_GATEWAY_SERVICE_NAME || 'api-gateway',
        port: port,
        hostname: process.env.HOSTNAME || 'api-gateway',
        healthPath: process.env.API_GATEWAY_HEALTH_PATH || '/health',
        healthInterval: process.env.API_GATEWAY_HEALTH_INTERVAL || '10s',
        tags: ['v1', 'gateway', process.env.SERVICE_ENV || 'local']
    });

    await consulRegistration.onModuleInit();

    await app.listen(port);
    console.log(`API Gateway listening on port ${port}`);
}

bootstrap();