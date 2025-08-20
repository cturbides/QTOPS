import 'reflect-metadata';
import { Max } from 'class-validator';
import { CursoCompleto } from './curso-completo.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity('evaluaciones')
export class Evaluacion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    @Max(5)
    puntuacion: number; 

    @Column({ type: 'text', nullable: true })
    comentario?: string;

    @ManyToOne(() => CursoCompleto, curso => curso.evaluaciones, { onDelete: 'CASCADE' })
    curso: CursoCompleto;
}
