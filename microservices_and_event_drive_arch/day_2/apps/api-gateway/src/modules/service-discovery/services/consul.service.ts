import consul from 'consul';
import { Injectable, Logger } from '@nestjs/common';
import { DEFAULT_CONSUL_HOST, DEFAULT_CONSUL_PORT } from '../constants/common';

@Injectable()
export class ConsulService {
  private client: consul.Consul;

  constructor(private readonly logger: Logger) {
    try {
      this.client = consul({
        host: process.env.CONSUL_HOST || DEFAULT_CONSUL_HOST,
        port: String(process.env.CONSUL_PORT || DEFAULT_CONSUL_PORT),
        promisify: true
      });
    } catch (error) {
      this.logger.error('Consul client initialization failed', error);
      throw new Error(`Failed to initialize Consul client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
      throw error;
    }
  }

  async deregister(id: string) {
    try {
      return await this.client.agent.service.deregister(id);
    } catch (error) {
      this.logger.warn(`Failed to deregister service ${id}:`, error);
      throw error;
    }
  }

  async getHealthyService(serviceName: string) {
    try {
      const result = await this.client.health.service({
        service: serviceName,
        passing: true
      });
      
      return (result as any[])[1]?.map((entry: any) => ({
        address: entry.Service.Address || entry.Node.Address,
        port: entry.Service.Port
      })) || [];
    } catch (error) {
      this.logger.warn(`Failed to get healthy services for ${serviceName}:`, error);
      return [];
    }
  }
}