import { Injectable, Logger } from '@nestjs/common';
import Consul from 'consul';

@Injectable()
export class ConsulClient {
  private consul: any;
  private readonly logger = new Logger(ConsulClient.name);

  constructor() {
    const consulUrl = process.env.CONSUL_HTTP_ADDR?.replace('http://', '') || 'consul:8500';
    const [host, portStr] = consulUrl.split(':');
    const port = parseInt(portStr) || 8500;
    
    this.consul = Consul({ 
      host: host || 'consul', 
      port: port.toString(),
      promisify: true 
    });
    
    this.logger.log(`Consul client initialized for ${host}:${port}`);
  }

  getConsul(): any {
    return this.consul;
  }
}