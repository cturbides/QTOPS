import { OmitType } from '@nestjs/mapped-types';
import { LeccionCompleta } from '../entities/leccion-completa.entity';

export class CreateLeccionCompletaDto extends OmitType(LeccionCompleta, ['id', 'curso'] as const) { }
