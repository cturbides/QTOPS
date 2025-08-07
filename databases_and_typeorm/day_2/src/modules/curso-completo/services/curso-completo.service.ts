import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { Etiqueta } from '@curso-completo/entities/etiqueta.entity';
import { Instructor } from '@curso-completo/entities/instructor.entity';
import { DetalleCurso } from '@curso-completo/entities/detalle-curso.entity';
import { CreateEtiquetaDto } from '@curso-completo/dtos/create-etiqueta.dto';
import { CursoCompleto } from '@curso-completo/entities/curso-completo.entity';
import { CreateInstructorDto } from '@curso-completo/dtos/create-instructor.dto';
import { LeccionCompleta } from '@curso-completo/entities/leccion-completa.entity';
import { CreateCursoCompletoDto } from '@curso-completo/dtos/create-curso-completo.dto';

@Injectable()
export class CursoCompletoService {
    constructor(
        @InjectRepository(CursoCompleto)
        private cursoRepository: Repository<CursoCompleto>,
        @InjectRepository(Etiqueta)
        private etiquetaRepository: Repository<Etiqueta>,
        @InjectRepository(Instructor)
        private instructorRepository: Repository<Instructor>
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
}
