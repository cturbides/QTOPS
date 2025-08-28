import 'reflect-metadata';
import { CursoCompleto } from './curso-completo.entity';
import { BaseEntity } from './templates/base-entity.template';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('instructores')
export class Instructor extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 150 })
    email: string;

    @OneToMany(() => CursoCompleto, curso => curso.instructor)
    cursos: CursoCompleto[];
}
