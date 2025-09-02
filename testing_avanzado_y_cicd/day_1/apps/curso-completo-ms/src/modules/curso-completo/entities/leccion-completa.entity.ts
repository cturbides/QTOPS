import 'reflect-metadata';
import { CursoCompleto } from './curso-completo.entity';
import { BaseEntity } from './templates/base-entity.template';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('lecciones_completas')
export class LeccionCompleta extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200 })
    titulo: string;

    @Column('text')
    contenido: string;

    // Una lección pertenece a un curso
    @ManyToOne(() => CursoCompleto, curso => curso.lecciones, {
        onDelete: 'CASCADE'
    })
    curso: CursoCompleto;
}
