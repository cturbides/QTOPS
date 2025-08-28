import { Injectable, Logger } from '@nestjs/common';
import Consul from 'consul';

@Injectable()
export class ConsulClient {
  private consul: Consul;
  private readonly logger = new Logger(ConsulClient.name);

  constructor() {
    const consulUrl = process.env.CONSUL_HTTP_ADDR?.replace('http://', '') || 'consul:8500';
    const [host, port] = consulUrl.split(':');
    
    this.consul = new Consul({ 
      host: host || 'consul', 
      port: parseInt(port) || 8500,
      promisify: true 
    });
    
    this.logger.log(`Consul client initialized for ${host}:${port}`);
  }

  getConsul(): Consul {
    return this.consul;
  }
}