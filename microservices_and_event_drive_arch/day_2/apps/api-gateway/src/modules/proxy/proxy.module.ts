import { Module } from '@nestjs/common';
import { ServiceDiscoveryModule } from '@shared/modules/service-discovery/service-discovery.module';
import { CursoCompletoProxyController } from './curso-completo.proxy.controller';
import { CursoDiscoveryProxyController } from './curso-discovery.proxy.controller';

@Module({
  imports: [ServiceDiscoveryModule],
  controllers: [CursoCompletoProxyController, CursoDiscoveryProxyController],
})
export class ProxyModule {}