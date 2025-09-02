import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateEtiquetaDto {
  @IsNotEmpty()
  @MaxLength(50)
  nombre: string;
}
