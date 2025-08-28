import 'reflect-metadata';
import { CursoCompleto } from './curso-completo.entity';
import { BaseEntity } from './templates/base-entity.template';
import { Entity, Column, OneToOne, PrimaryGeneratedColumn, } from 'typeorm';

@Entity('detalles_curso')
export class DetalleCurso extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    objetivos: string;

    @Column('text')
    requisitos: string;

    @Column('text')
    publicoObjetivo: string;

    @OneToOne(() => CursoCompleto, curso => curso.detalle)
    curso: CursoCompleto;
}
