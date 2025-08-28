import { HttpModule } from '@nestjs/axios';
import { Module, Logger } from '@nestjs/common';
import { ConsulService } from './services/consul.service';
import { ELearningServiceRegistry } from './services/e-learning-registry.service';
import { IntelligentLoadBalancer } from './services/intelligent-load-balancer.service';

@Module({
  imports: [HttpModule],
  providers: [Logger, ConsulService, IntelligentLoadBalancer, ELearningServiceRegistry],
  exports: [ELearningServiceRegistry]
})
export class ServiceDiscoveryModule {}