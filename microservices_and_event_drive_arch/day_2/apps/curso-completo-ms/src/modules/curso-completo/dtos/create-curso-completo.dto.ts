import { OmitType } from '@nestjs/mapped-types';
import { CreateDetalleCursoDto } from './create-detalle-curso.dto';
import { CreateLeccionCompletaDto } from './create-leccion-completa.dto';
import { CursoCompleto } from '../entities/curso-completo.entity';

class BaseCursoCompletoDto extends OmitType(CursoCompleto, [
    'id',
    'detalle',
    'lecciones',
    'etiquetas',
    'instructor',
    'createdAt',
    'updatedAt',
] as const) { }

export class CreateCursoCompletoDto extends BaseCursoCompletoDto {
    instructorId?: string;
    etiquetaIds?: string[];
    detalle: CreateDetalleCursoDto;
    lecciones: CreateLeccionCompletaDto[];
}
