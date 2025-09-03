import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { cacheModuleOptions } from "@cache/config/index";
import { Etiqueta } from './entities/etiqueta.entity';
import { Instructor } from './entities/instructor.entity';
import { Evaluacion } from './entities/evaluacion.entity';
import { DetalleCurso } from './entities/detalle-curso.entity';
import { CursoCompleto } from './entities/curso-completo.entity';
import { LeccionCompleta } from './entities/leccion-completa.entity';
import { CursoCompletoService } from './services/curso-completo.service';
import { CursoCompletoController } from './controllers/curso-completo.controller';
import { CursoDiscoveryController } from './controllers/curso-discovery.controller';
import { CursoCompletoV2Controller } from './controllers/curso-completo-v2.controller';
import { CursoDiscoveryV2Controller } from './controllers/curso-discovery-v2.controller';
import { DatabasePerformanceInterceptor } from '@performance/interceptors/database.interceptor';
import { VersioningModule } from '@shared-modules/versioning/versioning.module';

@Module({
    exports: [CursoCompletoService],
    controllers: [
        // V1 Controllers (original)
        CursoCompletoController, 
        CursoDiscoveryController,
        // V2 Controllers (new)
        CursoCompletoV2Controller,
        CursoDiscoveryV2Controller,
    ],
    imports: [
        CacheModule.register(cacheModuleOptions),
        TypeOrmModule.forFeature([CursoCompleto, DetalleCurso, LeccionCompleta, Etiqueta, Instructor, Evaluacion]),
        VersioningModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: DatabasePerformanceInterceptor
        },
        CursoCompletoService
    ],
})
export class CursoCompletoModule { }
