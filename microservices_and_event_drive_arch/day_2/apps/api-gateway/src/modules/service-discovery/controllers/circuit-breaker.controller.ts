import { Controller, Get, Param, Post, HttpCode } from '@nestjs/common';
import { ELearningServiceRegistry } from '../service-discovery/services/e-learning-registry.service';

@Controller('circuit-breaker')
export class CircuitBreakerController {
  constructor(
    private readonly serviceRegistry: ELearningServiceRegistry
  ) {}

  @Get('status/:serviceName')
  getCircuitBreakerStatus(@Param('serviceName') serviceName: string) {
    return {
      serviceName,
      state: this.serviceRegistry.getCircuitBreakerState(serviceName),
      metrics: this.serviceRegistry.getCircuitBreakerMetrics(serviceName)
    };
  }

  @Get('metrics')
  getAllCircuitBreakerMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.serviceRegistry.getAllCircuitBreakerMetrics()
    };
  }

  @Post('reset/:serviceName')
  @HttpCode(200)
  resetCircuitBreaker(@Param('serviceName') serviceName: string) {
    this.serviceRegistry.resetCircuitBreaker(serviceName);
    return {
      message: `Circuit breaker reset for service: ${serviceName}`,
      timestamp: new Date().toISOString()
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'circuit-breaker-controller',
      timestamp: new Date().toISOString()
    };
  }
}
