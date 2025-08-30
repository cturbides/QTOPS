import { Etiqueta } from '../entities/etiqueta.entity';
import { Instructor } from '../entities/instructor.entity';
import { CreateEtiquetaDto } from '../dtos/create-etiqueta.dto';
import { CursoCompleto } from '../entities/curso-completo.entity';
import { CreateInstructorDto } from '../dtos/create-instructor.dto';
import { CreateEvaluacionDto } from '../dtos/create-evaluacion.dto';
import { CursoCompletoService } from '../services/curso-completo.service';
import { CreateCursoCompletoDto } from '../dtos/create-curso-completo.dto';
import { ApiVersion } from '@shared-modules/versioning/types/version.types';
import { Version } from '@shared-modules/versioning/decorators/version.decorators';
import { CursoCompletoAdvanceSearchDto } from "../dtos/curso-completo-advance-search.dto";
import { Body, Controller, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { GetCursoCompletoConEvaluacionesDto } from "../dtos/get-curso-completo-con-evaluaciones.dto";
import { VersionHeaderInterceptor } from '@shared-modules/versioning/interceptors/version-header.interceptor';

@Controller('v2/cursos')
@UseInterceptors(VersionHeaderInterceptor)
@Version(ApiVersion.V2)
export class CursoCompletoV2Controller {
    constructor(private readonly cursoService: CursoCompletoService) { }

    @Post()
    async create(@Body() dto: CreateCursoCompletoDto): Promise<{
        data: CursoCompleto;
        version: string;
        timestamp: string;
    }> {
        console.log(`[V2] Creando curso completo`);
        const curso = await this.cursoService.saveCursoCompleto(dto);
        
        return {
            data: curso,
            version: ApiVersion.V2,
            timestamp: new Date().toISOString(),
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<{
        data: CursoCompleto | null;
        version: string;
        timestamp: string;
        metadata?: any;
    }> {
        console.log(`[V2] Buscando curso completo con ID: ${id}`);
        const curso = await this.cursoService.obtenerCursoConTodoDetalle(id);
        
        return {
            data: curso,
            version: ApiVersion.V2,
            timestamp: new Date().toISOString(),
            metadata: {
                includesDetails: true,
                relations: ['evaluaciones', 'instructor', 'etiquetas'],
            },
        };
    }

    @Get('/search/advanced')
    async findUsingAdvanceSearch(@Query() params: CursoCompletoAdvanceSearchDto): Promise<{
        data: CursoCompleto[] | null[];
        version: string;
        timestamp: string;
        pagination?: any;
    }> {
        console.log(`[V2] Buscando cursos con búsqueda avanzada`);
        const cursos = await this.cursoService.busquedaAvanzadaOptimizada(params);
        
        return {
            data: cursos,
            version: ApiVersion.V2,
            timestamp: new Date().toISOString(),
            pagination: {
                total: cursos.length,
                hasMore: false, // Implementar lógica de paginación real
            },
        };
    }

    @Post('etiquetas')
    async crearEtiqueta(@Body() dto: CreateEtiquetaDto): Promise<{
        data: Etiqueta;
        version: string;
        timestamp: string;
    }> {
        console.log(`[V2] Creando etiqueta`);
        const etiqueta = await this.cursoService.crearEtiqueta(dto);
        
        return {
            data: etiqueta,
            version: ApiVersion.V2,
            timestamp: new Date().toISOString(),
        };
    }

    @Post('instructores')
    async crearInstructor(@Body() dto: CreateInstructorDto): Promise<{
        data: Instructor;
        version: string;
        timestamp: string;
    }> {
        console.log(`[V2] Creando instructor`);
        const instructor = await this.cursoService.crearInstructor(dto);
        
        return {
            data: instructor,
            version: ApiVersion.V2,
            timestamp: new Date().toISOString(),
        };
    }

    @Get('estadisticas/promedios')
    async obtenerPromedios(): Promise<{
        data: GetCursoCompletoConEvaluacionesDto[];
        version: string;
        timestamp: string;
        summary: any;
    }> {
        console.log(`[V2] Obteniendo cursos con promedios de evaluaciones`);

        const result = await this.cursoService.obtenerCursosConPromedioEvaluaciones();
        const { entities, raw } = result;

        const data = entities.map((curso: CursoCompleto, idx: number) => ({
            curso: curso,
            promedio: parseFloat(raw[idx].promedio ?? 0),
            totalEvaluaciones: parseInt(raw[idx].totalEvaluaciones ?? 0, 10)
        }));

        return {
            data,
            version: ApiVersion.V2,
            timestamp: new Date().toISOString(),
            summary: {
                totalCursos: data.length,
                promedioGeneral: data.reduce((acc, item) => acc + item.promedio, 0) / data.length,
                totalEvaluaciones: data.reduce((acc, item) => acc + item.totalEvaluaciones, 0),
            },
        };
    }

    @Post(':id/evaluaciones')
    async crearEvaluacion(
        @Param('id') id: string, 
        @Body() dto: CreateEvaluacionDto
    ): Promise<{
        data: any;
        version: string;
        timestamp: string;
    }> {
        console.log(`[V2] Creando evaluación para curso con ID: ${id}`);
        const evaluacion = await this.cursoService.crearEvaluacion(id, dto);

        return {
            data: evaluacion,
            version: ApiVersion.V2,
            timestamp: new Date().toISOString(),
        };
    }

    // Nuevos endpoints específicos de V2
    @Get('health')
    getHealthV2() {
        return {
            status: 'healthy',
            version: ApiVersion.V2,
            service: 'curso-completo-ms',
            timestamp: new Date().toISOString(),
            features: ['advanced-search', 'enhanced-responses', 'detailed-metadata'],
        };
    }

    @Get('version')
    getVersionInfo() {
        return {
            version: ApiVersion.V2,
            service: 'curso-completo-ms',
            timestamp: new Date().toISOString(),
            capabilities: [
                'enhanced-response-format',
                'detailed-metadata',
                'improved-error-handling',
                'advanced-search-v2',
            ],
            compatibility: {
                v1: true,
                v2: true,
            },
        };
    }
}
