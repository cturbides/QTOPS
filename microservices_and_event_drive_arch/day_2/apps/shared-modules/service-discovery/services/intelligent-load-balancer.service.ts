import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ServiceInstance } from '../interfaces/service-discovery.interfaces';
import { ConsulService } from './consul.service';
import { InstanceMetrics } from '../types/load-balancer.types';
import { DEFAULT_TTL_PER_MSG } from '../constants/common';

@Injectable()
export class IntelligentLoadBalancer {
  private readonly metrics = new Map<string, InstanceMetrics>();
  private readonly caches = new Map<string, ServiceInstance[]>(); // nombre -> instancias (último fetch)
  private lastFetch = new Map<string, number>();
  private readonly ttlMs = DEFAULT_TTL_PER_MSG;

  constructor(private readonly consul: ConsulService) {}

  private async fetchHealthy(serviceName: string): Promise<ServiceInstance[]> {
    const now = Date.now();
    if (this.caches.has(serviceName) && (now - (this.lastFetch.get(serviceName) || 0)) < this.ttlMs) {
      return this.caches.get(serviceName)!;
    }
    
    try {
      const res = await new Promise((resolve, reject) => {
        this.consul.health.service({
          service: serviceName,
          passing: true
        }, (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      const instances: ServiceInstance[] = (res as any[]).map((s: any) => ({
        id: s.Service.ID,
        address: s.Service.Address,
        port: s.Service.Port,
        tags: s.Service.Tags,
        healthy: s.Checks.every((c: any) => c.Status === 'passing')
      }));
      
      this.caches.set(serviceName, instances);
      this.lastFetch.set(serviceName, now);
      return instances;
    } catch (error) {
      // Return empty array if consul is not available
      return [];
    }
  }

  async seleccionarInstancia(serviceName: string): Promise<ServiceInstance> {
    const instances = await this.fetchHealthy(serviceName);
    if (instances.length === 0) {
      throw new ServiceUnavailableException(`No hay instancias disponibles para ${serviceName}`);
    }

    // Weighted Response Time con penalización por errores e inFlight
    const weights = instances.map((inst) => {
      const m = this.metrics.get(inst.id) || { success:0, failures:0, responseTimeAvg:100, inFlight:0 };
      const errorPenalty = 1 + m.failures;
      const inflightPenalty = 1 + m.inFlight * 0.5;
      const base = 1 / (m.responseTimeAvg + 1);
      return base / (errorPenalty * inflightPenalty);
    });

    const total = weights.reduce((a,b)=>a+b,0);
    let r = Math.random() * total;
    for (let i=0;i<instances.length;i++) {
      if ((r -= weights[i]) <= 0) {
        const picked = instances[i];
        const m = this.metrics.get(picked.id) || { success:0, failures:0, responseTimeAvg:100, inFlight:0 };
        m.inFlight += 1;
        this.metrics.set(picked.id, m);
        return picked;
      }
    }
    return instances[0];
  }

  async registrarExito(id: string, rt: number) {
    const m = this.metrics.get(id) || { success:0, failures:0, responseTimeAvg:rt, inFlight:0 };
    m.success += 1;
    m.responseTimeAvg = Math.round((m.responseTimeAvg * 0.8) + (rt * 0.2));
    m.inFlight = Math.max(0, m.inFlight - 1);
    this.metrics.set(id, m);
  }

  async registrarError(id: string) {
    const m = this.metrics.get(id) || { success:0, failures:0, responseTimeAvg:100, inFlight:0 };
    m.failures += 1;
    m.inFlight = Math.max(0, m.inFlight - 1);
    this.metrics.set(id, m);
  }

  // Alias for proxy controllers
  pick(instances: ServiceInstance[]): ServiceInstance {
    if (instances.length === 0) {
      throw new ServiceUnavailableException('No instances available');
    }
    // Simple round-robin for now, or you can implement more sophisticated logic
    return instances[Math.floor(Math.random() * instances.length)];
  }
}