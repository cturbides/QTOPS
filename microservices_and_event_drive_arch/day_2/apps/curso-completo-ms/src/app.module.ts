import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestTypeOrmConfig } from './config/database';
import { HealthModule } from './modules/health/health.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { CursoCompletoModule } from './modules/curso-completo/curso-completo.module';
import { ConsulClient } from './modules/service-discovery/consul.client';
import { ConsulRegistration } from './modules/service-discovery/consul.registration';

@Module({
    imports: [
        TypeOrmModule.forRoot(NestTypeOrmConfig),
        HealthModule,
        CursoCompletoModule,
        PerformanceModule,
    ],
    providers: [
        ConsulClient,
        ConsulRegistration,
    ]
})
export class AppModule { }