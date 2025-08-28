import { Etiqueta } from '../entities/etiqueta.entity';
import { Instructor } from '../entities/instructor.entity';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateEtiquetaDto } from '../dtos/create-etiqueta.dto';
import { CursoCompleto } from '../entities/curso-completo.entity';
import { CreateInstructorDto } from '../dtos/create-instructor.dto';
import { CreateEvaluacionDto } from '../dtos/create-evaluacion.dto';
import { CursoCompletoService } from '../services/curso-completo.service';
import { CreateCursoCompletoDto } from '../dtos/create-curso-completo.dto';
import { CursoCompletoAdvanceSearchDto } from "../dtos/curso-completo-advance-search.dto";
import { GetCursoCompletoConEvaluacionesDto } from "../dtos/get-curso-completo-con-evaluaciones.dto";

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

    @Get('/search/advanced')
    async findUsingAdvanceSearch(@Query() params: CursoCompletoAdvanceSearchDto): Promise<CursoCompleto[] | null[]> {
        console.log(`Buscando cursos con búsqueda avanzada`);
        return this.cursoService.busquedaAvanzadaOptimizada(params);
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

    @Get('estadisticas/promedios')
    async obtenerPromedios(): Promise<GetCursoCompletoConEvaluacionesDto[]> {
        console.log(`Obteniendo cursos con promedios de evaluaciones`);

        const result = await this.cursoService.obtenerCursosConPromedioEvaluaciones();

        const { entities, raw } = result;

        return entities.map((curso: CursoCompleto, idx: number) => ({
            curso: curso,
            promedio: parseFloat(raw[idx].promedio ?? 0),
            totalEvaluaciones: parseInt(raw[idx].totalEvaluaciones ?? 0, 10)
        }));
    }

    @Post(':id/evaluaciones')
    crearEvaluacion(@Param('id') id: string, @Body() dto: CreateEvaluacionDto) {
        console.log(`Creando evaluación para curso con ID: ${id}`);

        return this.cursoService.crearEvaluacion(id, dto);
    }
}
