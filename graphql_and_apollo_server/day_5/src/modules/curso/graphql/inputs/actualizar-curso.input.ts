import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

@InputType()
export class ActualizarCursoInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  nombre: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  descripcion?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoria?: string;
}
