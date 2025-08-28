import { OmitType } from '@nestjs/mapped-types';
import { LeccionCompleta } from '@curso-completo/entities/leccion-completa.entity';

export class CreateLeccionCompletaDto extends OmitType(LeccionCompleta, ['id', 'curso'] as const) { }
