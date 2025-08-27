import { Module, Logger } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConsulService } from './services/consul.service';
import { IntelligentLoadBalancer } from './services/intelligent-load-balancer.service';
import { ELearningServiceRegistry } from './services/e-learning-registry.service';

@Module({
  imports: [HttpModule],
  providers: [Logger, ConsulService, IntelligentLoadBalancer, ELearningServiceRegistry],
  exports: [ELearningServiceRegistry]
})
export class ServiceDiscoveryModule {}