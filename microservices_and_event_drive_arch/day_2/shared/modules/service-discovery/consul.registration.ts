import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConsulClient } from './consul.client';

interface ConsulRegistrationConfig {
  serviceName: string;
  serviceId?: string;
  port: number;
  hostname?: string;
  healthPath?: string;
  healthInterval?: string;
  tags?: string[];
}

@Injectable()
export class ConsulRegistration implements OnModuleInit {
  private readonly logger = new Logger(ConsulRegistration.name);
  private config: ConsulRegistrationConfig;

  constructor(
    private readonly consulClient: ConsulClient,
    config: Partial<ConsulRegistrationConfig> = {}
  ) {
    this.config = {
      serviceName: config.serviceName || 'unknown-service',
      serviceId: config.serviceId || `${config.serviceName || 'unknown'}-${process.pid}`,
      port: config.port || 3000,
      hostname: config.hostname || process.env.HOSTNAME || 'localhost',
      healthPath: config.healthPath || '/health',
      healthInterval: config.healthInterval || '10s',
      tags: config.tags || ['v1', process.env.SERVICE_ENV || 'local']
    };
  }

  async onModuleInit() {
    const consul = this.consulClient.getConsul();

    try {
      await consul.agent.service.register({
        id: this.config.serviceId,
        name: this.config.serviceName,
        address: this.config.hostname,
        port: this.config.port,
        tags: this.config.tags,
        check: {
          http: `http://${this.config.hostname}:${this.config.port}${this.config.healthPath}`,
          interval: this.config.healthInterval,
          deregistercriticalserviceafter: '1m',
        },
      });

      this.logger.log(
        `Service registered with Consul: ${this.config.serviceName} (${this.config.serviceId}) at ${this.config.hostname}:${this.config.port}`
      );
    } catch (error: any) {
      this.logger.error(`Failed to register service with Consul: ${error.message}`, error.stack);
    }
  }
}

@Injectable()
export class ConsulRegistrationFactory {
  constructor(private readonly consulClient: ConsulClient) {}

  create(config: Partial<ConsulRegistrationConfig>): ConsulRegistration {
    return new ConsulRegistration(this.consulClient, config);
  }
}