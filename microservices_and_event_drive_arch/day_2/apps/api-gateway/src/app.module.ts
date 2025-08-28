import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { ServiceDiscoveryModule } from './modules/service-discovery/service-discovery.module';
import { ProxyModule } from './modules/proxy/proxy.module';

@Module({
    imports: [
        HealthModule,
        PerformanceModule,
        ServiceDiscoveryModule,
        ProxyModule,
    ]
})
export class AppModule { }