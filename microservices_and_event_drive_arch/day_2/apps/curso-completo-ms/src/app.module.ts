import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './database/config';
import { HealthModule } from '@health/health.module';
import { PerformanceModule } from '@performance/performance.module';
import { CursoCompletoModule } from './modules/curso-completo/curso-completo.module';
import { ServiceDiscoveryModule } from '@shared-modules/service-discovery/service-discovery.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(TypeOrmConfig),
        HealthModule,
        PerformanceModule,
        CursoCompletoModule,
        ServiceDiscoveryModule,
    ]
})
export class AppModule { }