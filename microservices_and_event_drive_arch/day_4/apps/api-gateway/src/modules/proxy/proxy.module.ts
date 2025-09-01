import { Module } from '@nestjs/common';
import { EventosProxyController } from './eventos.proxy.controller';
import { AnalyticsProxyController } from './analytics.proxy.controller';
import { VersioningModule } from '@shared-modules/versioning/versioning.module';
import { EnrollmentSagaProxyController } from './enrollment-saga.proxy.controller';
import { SagaMonitoringProxyController } from './saga-monitoring.proxy.controller';
import { ServiceDiscoveryModule } from '@shared-modules/service-discovery/service-discovery.module';
import { VersionedCursoCompletoProxyController } from './versioned-curso-completo.proxy.controller';
import { VersionedCursoDiscoveryProxyController } from './versioned-curso-discovery.proxy.controller';

@Module({
  imports: [ServiceDiscoveryModule, VersioningModule],
  controllers: [
    EventosProxyController,
    AnalyticsProxyController,
    EnrollmentSagaProxyController,
    SagaMonitoringProxyController,
    // Solo controladores versionados (incluyen fallback para compatibilidad)
    VersionedCursoCompletoProxyController,
    VersionedCursoDiscoveryProxyController,
  ],
})
export class ProxyModule { }