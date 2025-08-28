import { EducationalService } from '@modules/service-discovery/interfaces/service-discovery.interfaces';
import { ELearningServiceRegistry } from '@modules/service-discovery/services/e-learning-registry.service';

export async function registerServiceWithConsul(
  registry: ELearningServiceRegistry,
  port: number
): Promise<void> {
  const self: EducationalService = {
    tipo: process.env.SERVICE_NAME || 'course-service',
    host: process.env.SERVICE_HOST || 'localhost',
    port,
    version: process.env.SERVICE_VERSION || '1.0.0',
    dominio: process.env.SERVICE_DOMAIN || 'e-learning',
    capacidades: ['http', 'nestjs'],
    capacidadMaxima: 1000,
    rateLimitPerMinute: Number(process.env.SERVICE_RATE_LIMIT_PER_MINUTE || 600)
  };
  
  console.log(`Registering service with config:`, JSON.stringify(self, null, 2));
  await registry.registrarServicioEducativo(self);
  console.log(`Service ${self.tipo} registered with Consul successfully`);
}