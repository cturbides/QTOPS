import 'reflect-metadata';
import { Etiqueta } from "./etiqueta.entity";
import { Evaluacion } from "./evaluacion.entity";
import { Instructor } from "./instructor.entity";
import { DetalleCurso } from "./detalle-curso.entity";
import { IsNotEmpty, MinLength } from 'class-validator';
import { LeccionCompleta } from "./leccion-completa.entity";
import { BaseEntity } from "@curso-completo/entities/templates/base-entity.template";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToMany, JoinColumn, ManyToOne, JoinTable } from 'typeorm';

@Entity('cursos_completos')
export class CursoCompleto extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  titulo: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion: string;

  // OneToOne: Información detallada del curso
  @OneToOne(() => DetalleCurso, detalle => detalle.curso, { cascade: true })
  @JoinColumn()
  detalle: DetalleCurso;

  // OneToMany: Lecciones del curso
  @OneToMany(() => LeccionCompleta, leccion => leccion.curso, { cascade: true })
  lecciones: LeccionCompleta[];

  // ManyToMany: Etiquetas del curso
  @ManyToMany(() => Etiqueta, etiqueta => etiqueta.cursos)
  @JoinTable({ name: 'curso_etiquetas' })
  etiquetas: Etiqueta[];

  // ManyToOne: Instructor del curso
  @ManyToOne(() => Instructor, instructor => instructor.cursos)
  instructor: Instructor;

  // Un curso tiene muchas evaluaciones
  @OneToMany(() => Evaluacion, evaluacion => evaluacion.curso, { cascade: true })
  evaluaciones: Evaluacion[];
}

