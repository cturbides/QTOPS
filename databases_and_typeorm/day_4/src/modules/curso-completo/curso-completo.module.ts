import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Etiqueta } from '@curso-completo/entities/etiqueta.entity';
import { Instructor } from '@curso-completo/entities/instructor.entity';
import { Evaluacion } from '@curso-completo/entities/evaluacion.entity';
import { DetalleCurso } from '@curso-completo/entities/detalle-curso.entity';
import { CursoCompleto } from '@curso-completo/entities/curso-completo.entity';
import { LeccionCompleta } from '@curso-completo/entities/leccion-completa.entity';
import { CursoCompletoService } from '@curso-completo/services/curso-completo.service';
import { CursoCompletoController } from '@curso-completo/controllers/curso-completo.controller';

@Module({
    exports: [CursoCompletoService],
    providers: [CursoCompletoService],
    controllers: [CursoCompletoController],
    imports: [TypeOrmModule.forFeature([CursoCompleto, DetalleCurso, LeccionCompleta, Etiqueta, Instructor, Evaluacion])],
})
export class CursoCompletoModule { }
