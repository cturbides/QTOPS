import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './database/config';
import { HealthModule } from '@health/health.module';
import { PerformanceModule } from '@performance/performance.module';
import { CursoCompletoModule } from './modules/curso-completo/curso-completo.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { ServiceDiscoveryModule } from '@shared-modules/service-discovery/service-discovery.module';
import { VersioningModule } from '@shared-modules/versioning/versioning.module';
import { ObservabilityModule, CorrelationMiddleware, MetricsInterceptor } from '@shared-modules/observability';
import { EventsModule } from './events/events.module';
import { SagaModule } from './saga/saga.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(TypeOrmConfig),
        HealthModule,
        PerformanceModule,
        CursoCompletoModule,
        MetricsModule,
        ServiceDiscoveryModule,
        VersioningModule,
        ObservabilityModule,
        EventsModule,
        SagaModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: MetricsInterceptor,
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