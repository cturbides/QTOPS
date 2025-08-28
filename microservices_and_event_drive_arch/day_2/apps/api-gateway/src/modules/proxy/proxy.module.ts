import { Module } from '@nestjs/common';
import { CursoCompletoProxyController } from './curso-completo.proxy.controller';
import { CursoDiscoveryProxyController } from './curso-discovery.proxy.controller';
import { ServiceDiscoveryModule } from '@shared-modules/service-discovery/service-discovery.module';

@Module({
  imports: [ServiceDiscoveryModule],
  controllers: [CursoCompletoProxyController, CursoDiscoveryProxyController],
})
export class ProxyModule { }