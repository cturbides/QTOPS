import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './modules/database/config';
import { ProxyModule } from './modules/proxy/proxy.module';
import { HealthModule } from '@shared-modules/health/health.module';
import { PerformanceModule } from '@shared-modules/performance/performance.module';
import { ServiceDiscoveryModule } from '@shared-modules/service-discovery/service-discovery.module';
import { VersioningModule } from '@shared-modules/versioning/versioning.module';

@Module({
  imports: [
    ProxyModule,
    HealthModule,
    PerformanceModule,
    ServiceDiscoveryModule,
    VersioningModule,
    TypeOrmModule.forRoot(TypeOrmConfig),
  ]
})
export class AppModule { }