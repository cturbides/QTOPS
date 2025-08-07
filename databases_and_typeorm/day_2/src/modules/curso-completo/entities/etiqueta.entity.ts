import 'reflect-metadata';
import { CursoCompleto } from './curso-completo.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('etiquetas')
export class Etiqueta {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50, unique: true })
    nombre: string;

    @ManyToMany(() => CursoCompleto, curso => curso.etiquetas)
    cursos: CursoCompleto[];
}
