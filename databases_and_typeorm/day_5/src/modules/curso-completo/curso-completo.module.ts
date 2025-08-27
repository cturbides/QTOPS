import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { cacheModuleOptions } from "@cache/config/index";
import { Etiqueta } from '@curso-completo/entities/etiqueta.entity';
import { Instructor } from '@curso-completo/entities/instructor.entity';
import { Evaluacion } from '@curso-completo/entities/evaluacion.entity';
import { DetalleCurso } from '@curso-completo/entities/detalle-curso.entity';
import { CursoCompleto } from '@curso-completo/entities/curso-completo.entity';
import { LeccionCompleta } from '@curso-completo/entities/leccion-completa.entity';
import { CursoCompletoService } from '@curso-completo/services/curso-completo.service';
import { CursoCompletoController } from '@curso-completo/controllers/curso-completo.controller';
import { CursoDiscoveryController } from '@curso-completo/controllers/curso-discovery.controller';
import { DatabasePerformanceInterceptor } from '@performance/interceptors/database.interceptor';
import { ServiceDiscoveryModule } from '../service-discovery/service-discovery.module';

@Module({
    exports: [CursoCompletoService],
    controllers: [CursoCompletoController, CursoDiscoveryController],
    imports: [
        CacheModule.register(cacheModuleOptions),
        TypeOrmModule.forFeature([CursoCompleto, DetalleCurso, LeccionCompleta, Etiqueta, Instructor, Evaluacion]),
        ServiceDiscoveryModule
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
