import { HttpModule } from '@nestjs/axios';
import { Module, Logger } from '@nestjs/common';
import { ConsulService } from './services/consul.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { ELearningServiceRegistry } from './services/e-learning-registry.service';
import { CircuitBreakerWrapper } from './services/circuit-breaker-wrapper.service';
import { CircuitBreakerController } from './controllers/circuit-breaker.controller';
import { IntelligentLoadBalancer } from './services/intelligent-load-balancer.service';

@Module({
  imports: [HttpModule],
  providers: [
    Logger,
    ConsulService,
    CircuitBreakerService,
    CircuitBreakerWrapper,
    IntelligentLoadBalancer,
    ELearningServiceRegistry
  ],
  controllers: [CircuitBreakerController],
  exports: [ELearningServiceRegistry]
})
export class ServiceDiscoveryModule { }