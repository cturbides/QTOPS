import { Module } from '@nestjs/common';
import { ServiceDiscoveryModule } from '../service-discovery/service-discovery.module';
import { CursoCompletoProxyController, CursoDiscoveryProxyController } from './curso-completo.proxy.controller';

@Module({
  imports: [ServiceDiscoveryModule],
  controllers: [CursoCompletoProxyController, CursoDiscoveryProxyController],
})
export class ProxyModule {}