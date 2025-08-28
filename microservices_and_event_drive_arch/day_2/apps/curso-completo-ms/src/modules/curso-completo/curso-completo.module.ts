import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { cacheModuleOptions } from "../cache/config/index";
import { Etiqueta } from './entities/etiqueta.entity';
import { Instructor } from './entities/instructor.entity';
import { Evaluacion } from './entities/evaluacion.entity';
import { DetalleCurso } from './entities/detalle-curso.entity';
import { CursoCompleto } from './entities/curso-completo.entity';
import { LeccionCompleta } from './entities/leccion-completa.entity';
import { CursoCompletoService } from './services/curso-completo.service';
import { CursoCompletoController } from './controllers/curso-completo.controller';
import { CursoDiscoveryController } from './controllers/curso-discovery.controller';
import { DatabasePerformanceInterceptor } from '../performance/interceptors/database.interceptor';

@Module({
    exports: [CursoCompletoService],
    controllers: [CursoCompletoController, CursoDiscoveryController],
    imports: [
        CacheModule.register(cacheModuleOptions),
        TypeOrmModule.forFeature([CursoCompleto, DetalleCurso, LeccionCompleta, Etiqueta, Instructor, Evaluacion]),
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
