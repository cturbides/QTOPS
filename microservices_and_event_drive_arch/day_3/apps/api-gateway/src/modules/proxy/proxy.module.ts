import { Module } from '@nestjs/common';
import { VersionedCursoCompletoProxyController } from './versioned-curso-completo.proxy.controller';
import { VersionedCursoDiscoveryProxyController } from './versioned-curso-discovery.proxy.controller';
import { ServiceDiscoveryModule } from '@shared-modules/service-discovery/service-discovery.module';
import { VersioningModule } from '@shared-modules/versioning/versioning.module';

@Module({
  imports: [ServiceDiscoveryModule, VersioningModule],
  controllers: [
    // Solo controladores versionados (incluyen fallback para compatibilidad)
    VersionedCursoCompletoProxyController,
    VersionedCursoDiscoveryProxyController,
  ],
})
export class ProxyModule { }