import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestTypeOrmConfig } from '@shared/config/database';
import { HealthModule } from '@shared/modules/health/health.module';
import { PerformanceModule } from '@shared/modules/performance/performance.module';
import { ServiceDiscoveryModule } from '@shared/modules/service-discovery/service-discovery.module';
import { ProxyModule } from './modules/proxy/proxy.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(NestTypeOrmConfig),
        HealthModule,
        PerformanceModule,
        ServiceDiscoveryModule,
        ProxyModule,
    ]
})
export class AppModule { }