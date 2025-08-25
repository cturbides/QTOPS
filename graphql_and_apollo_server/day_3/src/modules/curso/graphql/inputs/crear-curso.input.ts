import { Field, ID, InputType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString } from 'class-validator';

@InputType()
export class CrearCursoInput {
    @Field()
    @IsString()
    titulo: string;

    @Field()
    @IsString()
    descripcion: string;

    @Field(() => ID)
    @IsString()
    instructorId: string;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    etiquetas?: string[];
}
