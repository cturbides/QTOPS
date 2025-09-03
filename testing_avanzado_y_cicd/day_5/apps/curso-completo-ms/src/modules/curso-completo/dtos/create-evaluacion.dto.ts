import { IsInt, Max, Min, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEvaluacionDto {
  @IsInt()
  @Min(1)
  @Max(5)
  puntuacion: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comentario?: string;
}
