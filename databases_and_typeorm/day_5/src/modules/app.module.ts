import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestTypeOrmConfig } from '@config/database';
import { HealthModule } from "@health/health.module";
import { PerformanceModule } from "@performance/performance.module";
import { CursoCompletoModule } from '@curso-completo/curso-completo.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(NestTypeOrmConfig),
        HealthModule,
        CursoCompletoModule,
        PerformanceModule,
    ]
})
export class AppModule { }
