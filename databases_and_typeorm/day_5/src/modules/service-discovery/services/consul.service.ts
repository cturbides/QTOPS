import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConsulService {
  private client: any;
  private readonly logger = new Logger(ConsulService.name);

  constructor() {
    try {
      const consul = require('consul');
      this.client = consul({
        host: process.env.CONSUL_HOST || 'localhost',
        port: Number(process.env.CONSUL_PORT || 8500),
        promisify: true
      });
    } catch (error) {
      this.logger.warn('Consul client initialization failed, using mock implementation');
      this.client = this.createMockClient();
    }
  }

  private createMockClient() {
    return {
      agent: {
        service: {
          register: () => Promise.resolve(),
          deregister: () => Promise.resolve()
        },
        check: {
          register: () => Promise.resolve()
        }
      },
      health: {
        service: (serviceName: string, options: any, callback?: Function) => {
          const mockResult: any[] = [];
          if (callback) {
            callback(null, mockResult);
          }
          return Promise.resolve(mockResult);
        }
      }
    };
  }

  get agent() { return this.client.agent; }
  get health() { return this.client.health; }

  async registerService(cfg: {
    id: string; name: string; address: string; port: number; tags?: string[]; meta?: Record<string,string>;
    checks?: any[];
    check?: any;
  }) {
    try {
      return await this.client.agent.service.register(cfg);
    } catch (error) {
      this.logger.warn(`Failed to register service ${cfg.name}:`, error);
    }
  }

  async deregister(id: string) {
    try {
      return await this.client.agent.service.deregister(id);
    } catch (error) {
      this.logger.warn(`Failed to deregister service ${id}:`, error);
    }
  }
}