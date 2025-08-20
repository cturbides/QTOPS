import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Etiqueta } from '@curso-completo/entities/etiqueta.entity';
import { Evaluacion } from '@curso-completo/entities/evaluacion.entity';
import { Instructor } from '@curso-completo/entities/instructor.entity';
import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { DetalleCurso } from '@curso-completo/entities/detalle-curso.entity';
import { CreateEtiquetaDto } from '@curso-completo/dtos/create-etiqueta.dto';
import { CursoCompleto } from '@curso-completo/entities/curso-completo.entity';
import { CreateEvaluacionDto } from '@curso-completo/dtos/create-evaluacion.dto';
import { CreateInstructorDto } from '@curso-completo/dtos/create-instructor.dto';
import { LeccionCompleta } from '@curso-completo/entities/leccion-completa.entity';
import { CreateCursoCompletoDto } from '@curso-completo/dtos/create-curso-completo.dto';
import { CursoCompletoAdvanceSearchDto } from '@curso-completo/dtos/curso-completo-advance-search.dto';
import { DEFAULT_CURSO_COMPLETO_SEARCH_LIMIT, DEFAULT_CURSO_COMPLETO_SEARCH_OFFSET, DEFAULT_CURSOC_COMPLETO_SEARCH_CACHE_TTL } from '@curso-completo/constants/common';

@Injectable()
export class CursoCompletoService {
    constructor(
        @InjectRepository(CursoCompleto)
        private cursoRepository: Repository<CursoCompleto>,
        @InjectRepository(Etiqueta)
        private etiquetaRepository: Repository<Etiqueta>,
        @InjectRepository(Instructor)
        private instructorRepository: Repository<Instructor>,
        @InjectRepository(Evaluacion)
        private evaluacionRepository: Repository<Evaluacion>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) { }

    async obtenerCursoConTodoDetalle(id: string): Promise<CursoCompleto | null> {
        return this.cursoRepository
            .createQueryBuilder('curso')
            .leftJoinAndSelect('curso.detalle', 'detalle')
            .leftJoinAndSelect('curso.lecciones', 'leccion')
            .leftJoinAndSelect('curso.etiquetas', 'etiqueta')
            .leftJoinAndSelect('curso.instructor', 'instructor')
            .where('curso.id = :id', { id })
            .getOne();
    }


    async saveCursoCompleto(dto: CreateCursoCompletoDto): Promise<CursoCompleto> {
        const { detalle, lecciones, etiquetaIds, instructorId, ...cursoData } = dto;

        let etiquetas: Etiqueta[] = [];
        if (etiquetaIds?.length) {
            etiquetas = await this.etiquetaRepository.find({ where: { id: In(etiquetaIds) } });
        }

        let instructor: Instructor | null = null;
        if (instructorId) {
            instructor = await this.instructorRepository.findOne({ where: { id: instructorId } }) as Instructor | null;
        }

        const curso = this.cursoRepository.create({
            ...cursoData,
            detalle: detalle as DetalleCurso,
            lecciones: (lecciones || []) as LeccionCompleta[],
            etiquetas,
            instructor: instructor || undefined
        });

        return this.cursoRepository.save(curso);
    }

    async crearEtiqueta(dto: CreateEtiquetaDto): Promise<Etiqueta> {
        const nombre = dto.nombre.trim().toLowerCase();
        const existente = await this.etiquetaRepository.findOne({ where: { nombre } });

        if (existente) {
            throw new BadRequestException(`La etiqueta '${dto.nombre}' ya existe`);
        }

        const etiqueta = this.etiquetaRepository.create({ nombre });

        return this.etiquetaRepository.save(etiqueta);
    }

    async crearInstructor(dto: CreateInstructorDto): Promise<Instructor> {
        const emailNorm = dto.email.trim().toLowerCase();
        const existente = await this.instructorRepository.findOne({ where: { email: emailNorm } });

        if (existente) {
            throw new BadRequestException(`Ya existe un instructor con email ${dto.email}`);
        }

        const instructor = this.instructorRepository.create({ nombre: dto.nombre.trim(), email: emailNorm });

        return this.instructorRepository.save(instructor);
    }

    async obtenerCursosConPromedioEvaluaciones(): Promise<{ entities: CursoCompleto[], raw: any }> {
        return this.cursoRepository
            .createQueryBuilder('curso')
            .leftJoin('curso.evaluaciones', 'ev')
            .addSelect('COALESCE(AVG(ev.puntuacion), 0)', 'promedio')
            .addSelect('COUNT(ev.id)', 'totalEvaluaciones')
            .leftJoinAndSelect('curso.instructor', 'instructor')
            .leftJoinAndSelect('curso.etiquetas', 'etiqueta')
            .groupBy('curso.id')
            .addGroupBy('instructor.id')
            .addGroupBy('etiqueta.id')
            .orderBy('promedio', 'DESC')
            .getRawAndEntities();
    }

    async crearEvaluacion(cursoId: string, dto: CreateEvaluacionDto): Promise<Evaluacion> {
        const curso = await this.cursoRepository.findOne({ where: { id: cursoId } });

        if (!curso) {
            throw new BadRequestException(`Curso con id ${cursoId} no existe`);
        }

        const evaluacion = this.evaluacionRepository.create({
            curso: curso,
            puntuacion: dto.puntuacion,
            comentario: dto.comentario,
        });

        return this.evaluacionRepository.save(evaluacion);
    }

    private generarCacheKey(parametros: any): string {
        return `busqueda:${JSON.stringify(parametros)}`;
    }

    async busquedaAvanzadaOptimizada(params: CursoCompletoAdvanceSearchDto): Promise<CursoCompleto[]> {
        const cacheKey = this.generarCacheKey(params);

        const resultadoCache: CursoCompleto[] | undefined = await this.cacheManager.get(cacheKey);

        if (resultadoCache) {
            return resultadoCache;
        }

        let query: SelectQueryBuilder<CursoCompleto> = this.cursoRepository
            .createQueryBuilder('curso')
            .leftJoinAndSelect('curso.detalle', 'detalle')
            .leftJoinAndSelect('curso.lecciones', 'lecciones')
            .leftJoinAndSelect('curso.etiquetas', 'etiquetas')
            .leftJoinAndSelect('curso.instructor', 'instructor')
            .leftJoinAndSelect('curso.evaluaciones', 'evaluaciones')
            .select([
                'curso.id',
                'curso.titulo',
                'curso.descripcion',
                'detalle',
                'lecciones',
                'etiquetas',
                'instructor',
                'evaluaciones',
                'curso.created_at',
                'curso.updated_at',
                'curso.deleted_at',
            ]);

        if (params.description) {
            query = query.andWhere('curso.descripcion ILIKE :description', { description: `%${params.description}%` });
        }

        if (params.textoBusqueda) {
            query = query.andWhere(
                "to_tsvector('spanish', curso.titulo || ' ' || curso.descripcion) @@ plainto_tsquery('spanish', :texto)",
                { texto: params.textoBusqueda }
            );
        }

        query = query
            .orderBy('curso.created_at', 'DESC')
            .addOrderBy('curso.titulo', 'ASC')
            .limit(params.limit || DEFAULT_CURSO_COMPLETO_SEARCH_LIMIT)
            .offset(params.offset || DEFAULT_CURSO_COMPLETO_SEARCH_OFFSET);

        const resultados = await query.getMany();

        await this.cacheManager.set(cacheKey, resultados, DEFAULT_CURSOC_COMPLETO_SEARCH_CACHE_TTL);

        return resultados;
    }

}
