import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConsulClient } from './consul.client';

@Injectable()
export class ConsulRegistration implements OnModuleInit {
  private readonly logger = new Logger(ConsulRegistration.name);

  constructor(private readonly consulClient: ConsulClient) {}

  async onModuleInit() {
    const consul = this.consulClient.getConsul();
    const serviceName = process.env.CURSO_COMPLETO_SERVICE_NAME || 'curso-completo';
    const id = `${serviceName}-${process.pid}`;
    const port = Number(process.env.CURSO_COMPLETO_PORT || 3002);
    const hostname = process.env.HOSTNAME || 'curso-completo-ms';

    try {
      await consul.agent.service.register({
        id,
        name: serviceName,
        address: hostname,
        port,
        tags: ['v1', process.env.SERVICE_ENV || 'local'],
        check: {
          http: `http://${hostname}:${port}${process.env.CURSO_COMPLETO_HEALTH_PATH || '/health'}`,
          interval: process.env.CURSO_COMPLETO_HEALTH_INTERVAL || '10s',
          deregistercriticalserviceafter: '1m',
        },
      });

      this.logger.log(`Service registered with Consul: ${serviceName} (${id}) at ${hostname}:${port}`);
    } catch (error: any) {
      this.logger.error(`Failed to register service with Consul: ${error.message}`, error.stack);
    }
  }
}