import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestTypeOrmConfig } from '../../shared/config/database';
import { HealthModule } from '../../shared/modules/health/health.module';
import { PerformanceModule } from '../../shared/modules/performance/performance.module';
import { CursoCompletoModule } from './modules/curso-completo/curso-completo.module';
import { ConsulClient } from '../../shared/modules/service-discovery/consul.client';
import { ConsulRegistration } from '../../shared/modules/service-discovery/consul.registration';

@Module({
    imports: [
        TypeOrmModule.forRoot(NestTypeOrmConfig),
        HealthModule,
        CursoCompletoModule,
        PerformanceModule,
    ],
    providers: [
        ConsulClient,
        {
            provide: ConsulRegistration,
            useFactory: (consulClient: ConsulClient) => {
                return new ConsulRegistration(consulClient, {
                    serviceName: process.env.CURSO_COMPLETO_SERVICE_NAME || 'curso-completo',
                    port: Number(process.env.CURSO_COMPLETO_PORT || 3002),
                    hostname: process.env.HOSTNAME || 'curso-completo-ms',
                    healthPath: process.env.CURSO_COMPLETO_HEALTH_PATH || '/health',
                    healthInterval: process.env.CURSO_COMPLETO_HEALTH_INTERVAL || '10s',
                });
            },
            inject: [ConsulClient],
        },
    ]
})
export class AppModule { }