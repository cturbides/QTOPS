import { OmitType } from '@nestjs/mapped-types';
import { DetalleCurso } from '@curso-completo/entities/detalle-curso.entity';

export class CreateDetalleCursoDto extends OmitType(DetalleCurso, ['id', 'curso'] as const) { }
