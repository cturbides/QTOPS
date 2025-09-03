import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './modules/database/config';
import { ProxyModule } from './modules/proxy/proxy.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { HealthModule } from '@shared-modules/health/health.module';
import { PerformanceModule } from '@shared-modules/performance/performance.module';
import { ServiceDiscoveryModule } from '@shared-modules/service-discovery/service-discovery.module';
import { VersioningModule } from '@shared-modules/versioning/versioning.module';
import { ObservabilityModule, CorrelationMiddleware, MetricsInterceptor } from '@shared-modules/observability';
import { ChaosModule, ChaosInterceptor } from '@shared-modules/chaos';

@Module({
  imports: [
    ProxyModule,
    MetricsModule,
    HealthModule,
    PerformanceModule,
    ServiceDiscoveryModule,
    VersioningModule,
    ObservabilityModule,
    ChaosModule, // Módulo de Chaos Engineering
    TypeOrmModule.forRoot(TypeOrmConfig),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ChaosInterceptor, // Interceptor de Chaos
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationMiddleware)
      .forRoutes('*');
  }
}