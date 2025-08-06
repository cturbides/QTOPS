import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from "@entities/templates/base-entity.template";
import { NivelDificultad } from "@entities/enum/nivel-dificultad.enum";
import { IsNotEmpty, IsString, MinLength, IsEnum, IsPositive, IsOptional, IsBoolean } from 'class-validator';

@Entity('cursos_online')
export class CursoOnline extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  titulo: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion: string;

  @Column({ type: 'enum', enum: NivelDificultad, default: NivelDificultad.PRINCIPIANTE })
  @IsEnum(NivelDificultad, { message: 'Nivel de dificultad inválido' })
  nivelDificultad: NivelDificultad;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  @IsPositive({ message: 'El precio debe ser positivo' })
  precio: number;

  @Column({ type: 'int', default: 0 })
  @IsOptional()
  duracionHoras?: number;

  // Added code
  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  activo: boolean = true;

  @Column({ type: 'text', array: true, default: [] })
  @IsString({ each: true })
  @IsNotEmpty({ message: 'Las etiquetas no pueden estar vacías', each: true })
  tags: string[] = [];
}

