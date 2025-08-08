import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Etiqueta } from '@curso-completo/entities/etiqueta.entity';
import { Instructor } from '@curso-completo/entities/instructor.entity';
import { CreateEtiquetaDto } from '@curso-completo/dtos/create-etiqueta.dto';
import { CursoCompleto } from '@curso-completo/entities/curso-completo.entity';
import { CreateInstructorDto } from '@curso-completo/dtos/create-instructor.dto';
import { CursoCompletoService } from '@curso-completo/services/curso-completo.service';
import { CreateCursoCompletoDto } from '@curso-completo/dtos/create-curso-completo.dto';

@Controller('cursos')
export class CursoCompletoController {
    constructor(private readonly cursoService: CursoCompletoService) { }

    @Post()
    create(@Body() dto: CreateCursoCompletoDto): Promise<CursoCompleto> {
        console.log(`Creando curso completo`);
        return this.cursoService.saveCursoCompleto(dto);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<CursoCompleto | null> {
        console.log(`Buscando curso completo con ID: ${id}`);
        return this.cursoService.obtenerCursoConTodoDetalle(id);
    }

    @Post('etiquetas')
    crearEtiqueta(@Body() dto: CreateEtiquetaDto): Promise<Etiqueta> {
        console.log(`Creando etiqueta`);
        return this.cursoService.crearEtiqueta(dto);
    }

    @Post('instructores')
    crearInstructor(@Body() dto: CreateInstructorDto): Promise<Instructor> {
        console.log(`Creando instructor`);
        return this.cursoService.crearInstructor(dto);
    }
}
