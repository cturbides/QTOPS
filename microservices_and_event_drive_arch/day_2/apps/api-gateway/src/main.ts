import 'dotenv/config'; 
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());

    const port = Number(process.env.API_GATEWAY_PORT || 3000);

    // Register with Consul for service discovery
    const consulUrl = process.env.CONSUL_HTTP_ADDR?.replace('http://', '') || 'consul:8500';
    const [host, portStr] = consulUrl.split(':');
    const consulHost = host || 'consul';
    const consulPort = parseInt(portStr) || 8500;
    
    // Simple Consul registration
    try {
        const consul = require('consul')({ 
            host: consulHost, 
            port: consulPort.toString(),
            promisify: true 
        });
        
        const serviceName = process.env.API_GATEWAY_SERVICE_NAME || 'api-gateway';
        const serviceId = `${serviceName}-${process.pid}`;
        const hostname = process.env.HOSTNAME || 'api-gateway';

        await consul.agent.service.register({
            id: serviceId,
            name: serviceName,
            address: hostname,
            port: port,
            tags: ['v1', 'gateway', process.env.SERVICE_ENV || 'local'],
            check: {
                http: `http://${hostname}:${port}/health`,
                interval: '10s',
                deregistercriticalserviceafter: '1m',
            },
        });

        console.log(`Service registered with Consul: ${serviceName} (${serviceId}) at ${hostname}:${port}`);
    } catch (error) {
        console.warn('Failed to register with Consul:', error);
    }

    await app.listen(port);
    console.log(`API Gateway listening on port ${port}`);
}

bootstrap();